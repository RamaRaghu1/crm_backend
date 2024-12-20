class ApiFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    search() {
      if (this.queryString.keyword) {
        const keyword = {
          name: {
            $regex: this.queryString.keyword,
            $options: "i", // Case-insensitive
          },
        };
        this.query = this.query.find({ ...keyword });
      }
      return this;
    }
  
    filter() {
      const queryCopy = { ...this.queryString };
  
      // Remove fields from the query to handle filtering separately
      const removeFields = ["keyword", "page", "limit"];
      removeFields.forEach((key) => delete queryCopy[key]);
  
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
      );
  
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
  
    pagination(resPerPage) {
      const page = Number(this.queryString.page) || 1;
      const skip = resPerPage * (page - 1);
  
      this.query = this.query.limit(resPerPage).skip(skip);
      return this;
    }
  }
  
export default ApiFeatures
  