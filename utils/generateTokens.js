import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      sameSite: "Strict",
    });
    console.log(` Token generated and cookie set successfully `);
    return token;
  } catch (error) {
    console.error("Error generating token or setting cookie:", error);
    throw new Error("Token generation or setting cookie failed.");
  }
};

export default generateToken;