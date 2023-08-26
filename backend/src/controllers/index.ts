import {Request, Response} from 'express';

export const HelloWorldHandler = (req: Request, res: Response) => {
	res.json({
		success: true,
		msg: 'hello world from /api'
	});
};
