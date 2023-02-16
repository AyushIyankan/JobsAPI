const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userID }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  const {
    user: { userID },
    params: { id: jobID },
  } = req;

  const jobFound = await Job.find({ _id: jobID, createdBy: userID });

  if (!jobFound) {
    throw new NotFoundError(`No Job found with id: ${jobFound}`);
  }

  res.status(StatusCodes.OK).json({ job: jobFound });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userID;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userID },
    params: { id: jobID },
  } = req;

  if (!company || !position) {
    throw new BadRequestError("Company or position cannot be empty");
  }

  const job = await Job.findByIdAndUpdate(
    { _id: jobID, createdBy: userID },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!job) {
    throw new NotFoundError(`Job with ID: ${jobID} doesn't exist`);
  }

  res.status(StatusCodes.OK).json({ job });
};
const deleteJob = async (req, res) => {
  const {
    params: { id: jobID },
    user: { userID },
  } = req;

  const job = await Job.findByIdAndRemove({
    _id: jobID,
    createdBy: userID,
  });

  if (!job) {
    throw new NotFoundError(`Job with ID: ${jobID} doesn't exist`);
  }

  res.status(StatusCodes.OK).send(`Job with ID: ${jobID} deleted`);
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
