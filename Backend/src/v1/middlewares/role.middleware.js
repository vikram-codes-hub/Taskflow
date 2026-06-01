import { sendError } from "../../utils/response.js";

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Access denied: insufficient permissions", 403);
    }
    next();
  };
};

export default authorizeRoles;