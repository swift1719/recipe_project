import Search from './models/Search';
import List from './models/list';
import Likes from './models/likes';
import Recipe from './models/recipe';   

import {elements,renderLoader,clearLoader} from './views/base';

import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as searchView from'./views/searchView';
import * as likesView from './views/likesView';
/*global state of the app
*-search object
*-current recipe object
*-shopping list object
*-Liked recipes
*/
const state={};

const controlSearch=async ()=>{
    
    const query=searchView.getInput();
    //console.log(query);
    
    if(query)
    {
        //new search object and add to state and parseIngredients
        state.search=new Search(query);

        //prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        //search for recipes

        try {
            await state.search.getResults();
            clearLoader();
            //render results on UI
            searchView.renderResults(state.search.result);
        } catch (error) {
                console.log(error);
                alert('Something went wrong with search...');
                clearLoader();
        }
        
    }

}

elements.searchForm.addEventListener('submit',e=>{
    e.preventDefault();
    controlSearch();
});



window.addEventListener('click',e=>{

    const btn=e.target.closest('.btn-inline');
    
    if(btn)
    {
        const goToPage=parseInt(btn.dataset.goto,10);
        searchView.clearResults(); 
        searchView.renderResults(state.search.result,goToPage);
        //console.log(goToPage);
    }
});



//recipe ctrllr

const controlRecipe=async ()=>{
    const id=window.location.hash.replace('#','');
  // console.log(id);

    if(id)
    {
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search){
            searchView.highlightSelected(id);
        }
        
        state.recipe=new Recipe(id);
        //console.log(state.recipe);
        try {
            await state.recipe.getRecipe();
           
            state.recipe.parseIngredients();
            //console.log(state.recipe);
            state.recipe.calcServings();
            
            //console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
            //console.log(state.recipe.ingredients);
        } catch (error) {
            console.log(error);
            //alert('Error processing recipe!');
        }

        
    }
};


['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe));

//List ctrllr

const controlList=()=>{
    if(!state.list) state.list =new List();

    state.recipe.ingredients.forEach(el=>{
        const item=state.list.addItem(el.count,el.unit,el.ingredient);
        listView.renderItem(item);
    });
};

elements.shopping.addEventListener('click',e=>{
    const id=e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete,.shopping__delete *'))
    {
        state.list.deleteItem(id);

        listView.deleteItem(id);
    }
    else if(e.target.matches('.shopping__count-value')){
        const val=parseFloat(e.target.value,10);
        state.list.updateCount(id,val);
    }

});



//Testing

const controlLike= ()=>{
    if(!state.likes) state.likes=new Likes();

    const currentId=state.recipe.id;

    if(!state.likes.isLiked(currentId)){

        const newLike=state.likes.addLike(currentId,state.recipe.title,state.recipe.author,state.recipe.img);

        likesView.toggleLikeBtn(true);

        likesView.renderLike(newLike);     
        //console.log(state.likes);
    
    }else{
        state.likes.deleteLike(currentId);

        likesView.toggleLikeBtn(false);

        likesView.deleteLike(currentId);
        //console.log(state.likes);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());

};


window.addEventListener('load',()=>{
    state.likes=new Likes();
    
    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());//no like at the beginning

    state.likes.likes.forEach(like=>likesView.renderLike(like));
});


elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease,.btn-decrease *')){
        if(state.recipe.servings>1)
        {
            state.recipe.updateServings('dec'); 
            recipeView.updateServingsIngredients(state.recipe);  
        }

    }else if(e.target.matches('.btn-increase,.btn-increase *')){

        state.recipe.updateServings('inc'); 
        recipeView.updateServingsIngredients(state.recipe);
        
    }else if(e.target.matches('.recipe__btn--add,recipe__btn--add *')){
        controlList();
    }
    else if(e.target.matches('.recipe__love,.recipe__love *')){
        controlLike();
    }
   
    //console.log(state.recipe.ingredients);
});


