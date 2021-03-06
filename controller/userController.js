const mongoose = require("mongoose");
const User = require("../model/users");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const factory = require("./factoryController");

//filtering objects for update fields for the user updating himself
const filterObj = (obj, ...allowedFilds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFilds.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// updating user informations
exports.updateMe = CatchAsync(async (req, res, next) => {
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConform) {
    return next(
      new AppError(
        "This route is for password update. Please use /updatePassword.",
        400
      )
    );
  }
  //2) Filtered Out unwanted fields
  const filteredBody = filterObj(req.body, "firstname", "lastname", "email");
  //3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,

    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  )
    .res.status(200)
    .json({
      status: "success!",
      data: { updatedUser },
    });
});

// deleting by the user = deActivating
exports.deleteMe = CatchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success!",
    data: null,
  });
});

//geting his oun profile
exports.getMe = CatchAsync(async (req, res, next) => {
  const doc = await User.findById(req.user.id);
  res.status(200).json({
    status: "success!",
    data: doc,
  });
});

//ONLY FOR ADMINS
exports.findAlluser = CatchAsync(async (req, res, next) => {
  const { firstname, lastname, email, sort, field } = req.query;

  let QueryObj = {};
  if (firstname) {
    QueryObj.firstname = { $regex: firstname, $options: "i" };
  }
  if (lastname) {
    QueryObj.lastname = { $regex: lastname, $options: "i" };
  }
  if (email) {
    QueryObj.email = { $regex: email, $options: "i" };
  }
  console.log(QueryObj);
  let result = User.find(QueryObj);
  if (sort) {
    const sortlist = sort.split(",").join(" ");
    result = result.sort(sortlist);
  } else {
    result = result.sort("createdAt");
  }

  //select the elements to apper from the filter
  if (field) {
    const fieldlist = field.split(",").join(" ");
    result = result.select(fieldlist);
  }

  const allUser = await result;

  if (!allUser) {
    res.status(200).json({
      message: "success!",
      data: `there is no User in the system`,
    });
  } else {
    res.status(200).json({
      message: "success!",
      data: { allUser },
    });
  }
});

exports.getUser = CatchAsync(async (req, res, next) => {
  const id = req.params.id;
  const doc = await User.findOne({ _id: id }, { new: true });

  res.status(200).json({
    status: "success!",
    data: doc,
  });
});
exports.deleteUser = CatchAsync(async (req, res, next) => {
  const id = req.params.id;
  const doc = await User.deleteOne({ _id: id }, { new: true });

  res.status(204).json({
    status: "success!",
    data: doc,
  });
});

exports.updateUserRole = CatchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "role");
  const id = req.params.id;
  //3) Update user document
  const updatedUserRole = await User.findByIdAndUpdate(
    { _id: id },
    filteredBody,
    {
      new: true,
      runValidators: false,
    }
  );

  res.status(200).json({
    status: "success!",
    data: { updatedUserRole },
  });
});
