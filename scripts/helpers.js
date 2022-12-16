//checks if two variables are equal, throws error if they aren't
export function assert_equals(a, b){
    //strict equality
    if(a !== b){
        throw new Error("Failed assertion "+ (a ? a :"null") +" and "+(b ? b : "null")+ "should be equal");
    }   
}

//checks if two variables are not equal, throws error if they aren't
export function assert_not_equals(a, b){
    //strict equality
    if(a === b){
        throw new Error("Failed assertion "+(a ? a: "null")+" and "+(b ? b : "null")+" should not be equal");
    }
}