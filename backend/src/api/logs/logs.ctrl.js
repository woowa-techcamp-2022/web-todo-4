import { readLogFromDB } from "../../queries.js";
import {getUserId} from "../../utils/authUtils.js";

export function insertLog(req, res) {}

export function readLog(req, res) {
  const callback = (result) => {
    if (result) res.json(result);
    else res.status(400).json({result: 'failed'});
  }
 readLogFromDB({ userId: getUserId(req), callback });
}
