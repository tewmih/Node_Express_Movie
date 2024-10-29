class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        let queryString = JSON.stringify(this.queryStr);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        
        const queryObject = JSON.parse(queryString);
        this.query = this.query.find(queryObject);

        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortStr = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortStr);
        } else {
            this.query = this.query.sort('name');
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fieldStr = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fieldStr);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 10;
        const skip = (page - 1) * limit;
        
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = ApiFeatures;  // Export the class if in another file
