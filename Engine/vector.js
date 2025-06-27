class Vector2 {
	x = 0;
	y = 0;

	constructor(xx,yy)
	{
		this.x = xx;
		this.y = yy;
	}

	/** 
	* @param {Vector2} vector 
	* @returns {Vector2} A new vector based on the original vector added with the provided vector
	*/
	Add(vector){
		return new Vector2(this.x + vector.x,this.y + vector.y);
	}
	
	/** 
	* @param {number} scaler 
	* @returns {Vector2} A new vector based on the original vector multiplied with the scaler
	*/
	Mult(scaler){
		return new Vector2(this.x * scaler,this.y * scaler);
	}

	/** 
	* @param {number} denominator 
	* @returns {Vector2} A new vector based on the original vector divided with the denominator
	*/
	Div(denominator){
		return new Vector2(this.x / denominator,this.y / denominator);
	}

	/** 
	* @param {Vector2} vector - Adds the provided vector into the current vector directly.
	* @returns {null}
	*/
	Merge(vector){
		this.x += vector.x;
		this.y += vector.y;
	}

	/** 
	* @param {number} acc - Adds the provided number to the vector's current heading.
	* @returns {null}
	*/
	Accelerate(acc){
        this.Merge(MoveToward(this.Heading(),acc));
        this.Copy()
	}

	/** 
	* @param {number} decl - Removes the provided number from the vector's current distance, bottoms out at 0.
	* @returns {null}
	*/
	Decelerate(decl){
        let dist = Magnitude() - decl;
        if(dist < 0) dist = 0;
        this.Copy(MoveToward(this.Heading(),decl));
	}

	/** 
	* @param {Vector2} vector 
	* @returns {Boolean} If the provided vector is equal to this vector.
	*/
	Equals(vector){
		return this.x === vector.x && this.y === vector.y;
	}

	/** 
	* @returns {Vector2} Copy of the current vector.
	*/
	Copy(){
		return new Vector2(this.x,this.y);
	}
	
	/** 
	* @returns {Vector2} An inverse copy of the current vector.
	*/
	Inverse(){
		return new Vector2(-this.x,-this.y);
	}

	/** 
	* @returns {number} An angle representing the heading of the vector. -1 if not possible.
	*/
	Heading(){
        if(this.x == 0 && this.y == 0) return -1;
		return FindAngle(0,0,this.x,this.y);
	}

	/** 
	* @returns {number} A number representing the length of the vector
	*/
	Magnitude(){
		return PointDistance(0,0,this.x,this.y);
	}
}
