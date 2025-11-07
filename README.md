# mongoose-howto

Tiny Mongoose walkthrough that models a simple university example and demonstrates two ways to compute an average: an instance method on the document and a MongoDB aggregation pipeline.

## What this project does

- Defines two Mongoose models:
  - `User` — a person with `name` and optional `email`.
  - `UE` (Unité d’Enseignement) — a course with:
    - `name` (String)
    - `teacher` (ObjectId ref to `User`)
    - `students` (Array of subdocs) where each item has:
      - `student` (ObjectId ref to `User`)
      - `mark` (Number)
- Adds an instance method `average()` on `UE` to compute the average mark from its `students` array in application code.
- Shows an equivalent MongoDB Aggregation Pipeline to compute the same average directly in the database.
- Loads configuration from a `.env` file and connects to MongoDB via a dedicated `db.mjs` module.

## Files of interest

- `model/User.js` — Mongoose schema and model for users.
- `model/UE.js` — Mongoose schema and model for courses. Includes the `average()` instance method:

  ```js
  ue.methods.average = function () {
    return (
      this.students.reduce((sum, { mark }) => sum + mark, 0) /
      this.students.length
    );
  };
  ```

- `db.mjs` — centralizes the MongoDB connection using `MONGODB_URI` from the environment.
- `index.mjs` — example script that:
  - connects to the database,
  - seeds sample data once (teacher + 2 students + one `UE` named "Python"),
  - logs the average computed by the instance method,
  - runs an aggregation to compute the same average in MongoDB.

## Aggregation explained

The pipeline in `index.mjs` computes the average mark for the course named "Python":

```js
const result = await UE.aggregate([
  { $match: { name: "Python" } },
  { $unwind: "$students" },
  { $group: { _id: "$name", averageMark: { $avg: "$students.mark" } } },
]);
```

- `$match` — restricts the documents to the `UE` named `"Python"`.
- `$unwind` — deconstructs the `students` array so each student/mark becomes its own input document for the next stage.
- `$group` — groups those rows by the course (here `_id: "$name"`) and computes the average of `students.mark` across them (`$avg`).

Example output shape:

```json
[{ "_id": "Python", "averageMark": 16 }]
```

This mirrors what the `average()` instance method does in-memory, but pushes the computation to MongoDB.

## Setup

1. Prerequisites

   - Node.js 18+ (ESM enabled)
   - A running MongoDB instance (defaults to local `mongodb://127.0.0.1:27017`)

2. Install dependencies

```bash
npm install
```

3. Configure environment

Create a `.env` file in the project root (already added in this repo by default) with:

```ini
MONGODB_URI=mongodb://127.0.0.1:27017/licence
```

4. Run the example

```bash
node index.mjs
# or during development
npm run dev
```

On first run it will seed the database with one course ("Python"), one teacher ("Dupont"), and two students with marks 15 and 17. You should see logs similar to:

```
[db] Connected to MongoDB
[seed] Inserted sample data
Instance average(): 16
Aggregate pipeline result: [ { _id: 'Python', averageMark: 16 } ]
[db] Connection closed
```

## Notes

- The connection string is read from `process.env.MONGODB_URI` in `db.mjs`.
- `.env` is ignored by Git via `.gitignore`.
- The aggregation uses `$match` on the course name for portability. If you prefer to match by `_id`, replace the `$match` stage accordingly (e.g., `{ $match: { _id: new mongoose.Types.ObjectId('<id>') } }`).
