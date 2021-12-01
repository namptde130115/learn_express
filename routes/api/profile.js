const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/profile/me
// @des     Get current users profile
// @access  Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

// @route   POST api/profile
// @des     Create or update profile
// @access  Private

router.post(
  "/",
  [auth, [check("skills", "skills is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company, website, location, skills } = req.body;
    //  build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/profile
// @des     Get all profile
// @access  Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

// @route   GET api/profile/user/:user_id
// @des     Get profile by user ID
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

// @route   DELETE api/profile
// @des     Delete profile, user
// @access  Private

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ idDeleted: req.user.id });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

// @route   PUT api/profile/experience
// @des     add profile experience
// @access  private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required").not().isEmpty(),
      check("company", "location is company").not().isEmpty(),
      check("location", "location is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location } = req.body;
    const newExp = {
      title,
      company,
      location,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @des     Delete profile experience
// @access  private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { experience: { _id: req.params.exp_id } } },
      { new: true }
    );

    // console.log("profile", profile);

    // // get find index
    // let deleteIndex = profile.experience.findIndex(
    //   (x) => x._id.valueOf() === req.params.exp_id
    // );
    // console.log("deleteIndex: ", deleteIndex);

    // // remove
    // profile.experience.splice(deleteIndex, 1);

    // await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

//   const profiles = await Profile.aggregate([
//     {
//       $lookup: {
//         from: "users",
//         localField: "user",
//         foreignField: "_id",
//         as: "author",
//       },
//     },
//     { $unwind: "$author" },
//     { $match: { "author.name": "trung nam" } },
//   ]);
//   console.log(profiles);
//   return res.json(profiles);
// });

module.exports = router;
