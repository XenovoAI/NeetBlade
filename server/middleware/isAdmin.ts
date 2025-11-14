import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../client/src/lib/supabaseClient'; // Adjust path as needed

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // This is a simplified check. In a real application, you'd want to
    // check a 'roles' table or a custom claim.
    if (user.email?.endsWith('@admin.com')) {
        return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
};
