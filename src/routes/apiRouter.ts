import { Router } from 'express';

import Paths from '@src/common/constants/Paths';

import FundRoutes from './FundRoutes';
import UserRoutes from './UserRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ----------------------- Add UserRouter --------------------------------- //

const userRouter = Router();

userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

apiRouter.use(Paths.Users._, userRouter);

// ----------------------- Add FundRouter --------------------------------- //

const fundRouter = Router();

fundRouter.get(Paths.Funds.Supply, FundRoutes.getSupply);

apiRouter.use(Paths.Funds._, fundRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;
