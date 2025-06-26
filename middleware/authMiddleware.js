import User from "../models/user.js";

// ✅ Middleware: Check if user is authenticated using crypto token
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("Unauthorized: No token provided");
      err.statusCode = 401;
      return next(err);
    }

    const token = authHeader.split(" ")[1];
    console.log(token);

    // 🔍 Check token in DB and its expiry
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }, // token valid till now
    });

    if (!user) {
      const err = new Error("Unauthorized: Invalid or expired token");
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new Error("Authentication failed");
    err.statusCode = 403;
    return next(err);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("Current user role:", req.user?.role); // 🔍 Log this
    if (!roles.includes(req.user.role)) {
      const err = new Error(
        `Access denied: Only [${roles.join(", ")}] allowed`
      );
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
};
