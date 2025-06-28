class Vector2 {
	x = 0;
	y = 0;

	constructor(xx,yy)
	{
		this.x = xx;
		this.y = yy;
	}

	/** 
	* @param {Vector2} vector - Adds the provided vector into the current vector.
	* @returns {Vector2} Returns this vector.
	*/
	Add(vector){
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}
	
	/** 
	* @param {number} scaler - Multiplied with the current vector.
	* @returns {Vector2} Returns this vector.
	*/
	Multiply(scaler){
		this.x *= scaler;
		this.y *= scaler;
		return this;
	}

	/** 
	* @param {number} denominator - Current vector is divided by this.
	* @returns {Vector2} Returns this vector.
	*/
	Divide(denominator){
		this.x /= denominator;
		this.y /= denominator;
		return this;
	}

	/** 
	* @param {number} acc - Adds the provided number to the vector's current magnitude without changing heading.
	* @returns {Vector2} Returns this vector.
	*/
	Accelerate(acc){
        this.Add(MoveToward(this.Heading(),acc));
		return this;
	}

	/** 
	* @param {number} decl - Removes the provided number from the vector's current magnitude, bottoms out at 0.
	* @returns {Vector2} Returns this vector.
	*/
	Decelerate(decl){
        let dist = Magnitude() - decl;
        if(dist < 0) dist = 0;
		let new_vec = MoveToward(this.Heading(),decl);
		this.Zero();
        this.Add(new_vec);
		return this;
	}

	/** 
	* Normalizes this vector to a unit distance of 1.
	* @returns {Vector2} Returns this vector.
	*/
	Normalized(){
		let heading = this.Heading();
		if(heading == -1) return this;
		let new_vec = MoveToward(heading,1);
		this.x = new_vec.x;
		this.y = new_vec.y;
		return this;
	}

	/** 
	* Inverts the sign of the vector's component x and y.
	* @returns {Vector2} Returns this vector.
	*/
	Inverse(){
		this.x *= -1;
		this.y *= -1;
		return this;
	}

	/** 
	* Returns the vector to its default state of 0,0
	* @returns {Vector2} Returns this vector.
	*/
	Zero(){
        this.x = 0;
		this.y = 0;
		return this;
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
