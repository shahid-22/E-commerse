var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require("../helpers/user-helpers")

/* GET home page. */

// Admin credentials
let credentials={
  adminName: "Admin",
  adminEmail: "shahid12345@gmail.com",
  adminPassword: "shahid12345"
}
// Admin credentials Till here

router.get('/login',(req,res)=>{
  if(req.session.adminLoggedIn){
    res.redirect('/admin');
  }else{
    res.render('admin/admin-login',{admin:true,adminLoginErr:req.session.adminLoginErr});
    req.session.adminLoginErr=false;
  }
})

router.post('/login',(req,res)=>{
  // console.log(req.body.email);
  if(req.body.email==credentials.adminEmail&&req.body.password==credentials.adminPassword){
    req.session.admin=req.body.email;
    req.session.adminLoggedIn=true;
    req.session.adminName=credentials.adminName;
    // console.log(req.session.adminName);
    res.redirect('/admin');
  }else{
    req.session.adminLoginErr="Invalid username or password";
    res.redirect('/admin/login');
  }
})

router.get('/', (req, res)=>{
  if(req.session.adminLoggedIn){
    // console.log(req.session.adminName);
    productHelpers.getAllProducts().then((products)=>{
      res.render('admin/admin-view',{admin:true,products,adminName:req.session.adminName});
    })
  }else{
    res.redirect('/admin/login');
  }
});

router.get('/add-product',(req,res)=>{
  if(req.session.adminLoggedIn){
    res.render('admin/add-product', {admin:true,adminName:req.session.adminName});
  }else{
    res.redirect('/admin/login');
  }
  
})

router.post('/add-product',(req,res)=>{
  productHelpers.addProduct(req.body,(id)=>{
    let img = req.files.image;
    img.mv('./public/product-images/'+id+'.jpg',(err)=>{
      if(!err) {
        res.render('admin/add-product',{admin:true});
      }else{
        console.log(err);
      }
    })
  })
})

router.get('/delete/:id',(req,res)=>{
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin');
  })
})

router.get('/editProduct/:id',async(req,res)=>{
  if(req.session.adminLoggedIn){
    let product = await productHelpers.getProductDetails(req.params.id);
    res.render('admin/edit-product',{product,admin:true,adminName:req.session.adminName});
  }else{
    res.redirect('/admin/login');
  }
})

router.post('/editProduct/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    try{
      let image = req.files.image;
      image.mv('./public/product-images/'+req.params.id+'.jpg');
      // console.log("working...");
    }catch{
      console.log("image not updated !!!");
    }finally{
      res.redirect('/admin');
    }
  })
}) 

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/admin/login');
})

//new add

router.get("/user-view",(req,res)=>{
  if(req.session.adminLoggedIn){
    productHelpers.getUserdata().then((users)=>{
      res.render("admin/user-view",{users,admin:true,adminName:req.session.adminName})

    })
  }
})

router.get("/addUser",(req,res)=>{
  if(req.session.adminLoggedIn){
    res.render("admin/add-user")
  }
})

router.post("/add-user",(req,res)=>{
  if(req.session.adminLoggedIn){
    userHelpers.doSignUp(req.body).then((response)=>{
      if(response){
        res.redirect("/admin/user-view")
      }
    })
  }

})
router.get('/editUser/:id',(req,res)=>{
  if(req.session.adminLoggedIn){
   productHelpers.getEditUserData(req.params.id).then((user)=>{
    res.render('admin/edit-user',{user,admin:true,adminName:req.session.adminName})

   })

   
  }
})

router.post('/editUser/:id',(req,res)=>{
  if(req.session.adminLoggedIn){
    productHelpers.editUser(req.body,req.params.id).then((response)=>{
      
  if(response){

    res.redirect("/admin/user-view")

  }
        

      
    })

  }

})

router.get('/deleteuser/:id',(req,res)=>{
  if(req.session.adminLoggedIn){
    productHelpers.deleteUser(req.params.id).then((response)=>{
      if(response){
        res.redirect("/admin/user-view")
      }
    
    })

  }
})


module.exports = router;
