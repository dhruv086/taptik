class ApiError extends Error{
  constructor(
    statusCode,
    message="something went wrong",
    error=[],
    stack=""
  ){
    super(message)
    this.statusCode=statusCode
    this.data=null
    this.errors=error
    this.success=false
    this.message=message
    
    if(stack){
      this.stack=stack
    }else{
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export {ApiError}
