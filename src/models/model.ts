import mongoose from "mongoose";

const ExampleSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        unique: true,
    },
});

const Model = mongoose.model("Example", ExampleSchema, "examples");

export default Model;