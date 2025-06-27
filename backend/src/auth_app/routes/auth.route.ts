import express, { Request, Response, NextFunction } from "express";
import { 
  signUp, 
  login, 
  logout, 
  checkAuth 
} from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();




// Regular auth routes
router.post("/signup", 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await signUp(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/login", 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await login(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/logout", 
  (req: Request, res: Response) => {
    logout(req, res);
  }
);

router.get("/check-auth", 
  protectRoute, 
  (req: Request, res: Response, next: NextFunction) => checkAuth(req, res).catch(next)
);

export default router;