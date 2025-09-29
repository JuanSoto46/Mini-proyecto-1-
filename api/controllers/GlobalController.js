class GlobalController {
  constructor(dao) {
    this.dao = dao; // Data Access Object to interact with persistence layer
  }

  // Create a new item
  async create(req, res) {
    console.log("Creating item with data:", req.body);
    try {
      const item = await this.dao.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Read an item by ID
  async read(req, res) {
    try {
      const item = await this.dao.read(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Update an existing item by ID
  async update(req, res) {
    try {
      const item = await this.dao.update(req.params.id, req.body);
      res.status(200).json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete an item by ID
  async delete(req, res) {
    try {
      const item = await this.dao.delete(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Retrieve all items, with optional filters from query params
  async getAll(req, res) {
    try {
      const items = await this.dao.getAll(req.query);
      res.status(200).json(items);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = GlobalController;
