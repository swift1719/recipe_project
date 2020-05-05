import axios from 'axios';

export default class recipe{
    constructor(id){
        this.id=id;
    }

    async getRecipe(){
        try{
            
            const res=await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title=res.data.recipe.title;
            this.author=res.data.recipe.publisher;
            this.img=res.data.recipe.image_url;
            this.url=res.data.recipe.source_url;
            this.ingredients=res.data.recipe.ingredients; 
            const numIng=res.data.recipe.ingredients.length;
            const periods=Math.ceil(numIng/3);
            this.time=periods*15;        
            
            //console.log(res.data);
        }catch(error){
            console.log(error);
            alert(`something went wrong :(`);
        }
    }
    calcServings(){
        this.servings=4;
    }

    parseIngredients(){

        const unitsLong=['jars','packages','tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds','grams','kilograms'];
        const unitsShort=['jars','packages','tbsps','tbsp','ozs','oz','tsps','tsp','cup','pound','g','kgs'];
        
        const newIngredients = this.ingredients.map(el=>{
            let ingredient=el.toLowerCase();
            
            unitsLong.forEach((unit,i)=>{
                ingredient=ingredient.replace(unit,unitsShort[i]);
            });
            ingredient=ingredient.replace(/ *\{[^)]*\} */g,'');

            const arrIng=ingredient.split(' ');
            
            let unitIndex=arrIng.findIndex(el2=>unitsShort.includes(el2));
            
            if(unitIndex>2){
                unitIndex=-1;
            }
            let objIng;
            
            if(unitIndex > -1)
            {
                const arrCount = arrIng.slice(0,unitIndex);
                let count;
               
                if(arrCount.length === 1){
                    count=arrIng[0].replace('-','+');
                    count=eval( `${count}`);
                    count=parseFloat(count).toFixed(1);
                }else{
                    
                    count=arrIng.slice(0,unitIndex).join('+');
                    count=eval(`${count}`);
                    count-parseFloat(count).toFixed(1);
                }
                objIng={
                    count,
                    unit:arrIng[unitIndex],
                    ingredient:arrIng.slice(unitIndex+1).join(' ')
                }

            }
            else if(parseInt(arrIng[0],10))
            {
                objIng={
                    count:parseInt(arrIng[0],10),
                    unit:'',
                    ingredient:arrIng.slice(1).join(' ')
                }
            }
            else if(unitIndex=== -1)
            {
                objIng={
                    count:1,
                    unit:'',
                    ingredient
                }
            }
           // console.log(objIng);
            return objIng; 
        });

        this.ingredients=newIngredients;
    }


    updateServings(type){
        const newServings= type==='dec'?this.servings-1:this.servings+1;
        //const newTime= type==='dec'?this.time*(newServings/this.servings):this.time*(newServings/this.servings);
        //this.time=newTime;
        this.ingredients.forEach(ing=>{
            ing.count*=(newServings/this.servings);
        });

        this.servings=newServings;
    
    }

}