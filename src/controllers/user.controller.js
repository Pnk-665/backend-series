import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, cloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {refreshToken, accessToken}

  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token");
    
    
  }

}

const registerUser = asyncHandler( async(req, res) =>{
  // get user details from frontend
  // validation - not empty
  // check if user already exist
  // check for images , check avatar image
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const {fullName, email, username, password} = req.body

  if ( [fullName, email, username, password].some( (field) => field?.trim() === ""))
    {
    throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (existedUser) {
      throw new ApiError(409,"User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
   
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath);

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
      throw new ApiError(400, "Avatar file upload failed");
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )

    if (!createdUser){
      throw new ApiError(400, " Something went wrong while registering user")
    }

    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler ( async (req, res) => {
  // req data
  //check username or email
  // check user
  // check password
  // give refresh token and access token

  const {email, username, password } = req.body

  if (!username || !email) {
    throw new Error(400,"User or email in invalid");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if(!user){
    throw new ApiError(404, "user does not exist"); 
  }

  const isPasswordValid = await user.isPasswordCorrect (password)

  if(!isPasswordValid){
    throw new ApiError(401, "password in invalid"); 
  }

  const {refreshToken, accessToken} = await generateAccessAndRefreshToken(user_._id)

  const loggedInUser = User.findById(user._id).select("-password -refreshToken")

  const options = {
    http: true,
    secure: true
  }

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse (200, {
      user: loggedInUser, accessToken, refreshToken
    }, "User logged in Successfully")
  )

})

const logoutUser = asyncHandler (async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
     {
      $set: {refreshToken: undefined}
    },
    {
      new: true
    }
  )

   const options = {
    http: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", accessToken, options)
  .clearCookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export {registerUser, loginUser, logoutUser}