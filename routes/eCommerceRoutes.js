const express = require('express');
const passport = require('passport');
const dealsModel = require('../models/dealsModel');
const router = express.Router();

/* home page (root route) */
router.get('/', async (req, res) => {
    const deals = await dealsModel.find();
    res.render('home', { deals: deals });
});

/* Display Admin login page */
router.get('/login', (req, res) => {
    res.render('login');
});

/* Admin Login logic, on successful login redirect to dashboard page */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

/* Display dashboard page for admin */
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const deals = await dealsModel.find();
        res.render('dashboard', { deals: deals });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }

});

/* Display addDeal page to add new deal */
router.get('/deals', isAuthenticated, (req, res) => {
    res.render('addDeal');
});

/* Save new deal to DB and redirect to dashboard */
router.post('/deals', isAuthenticated, async (req, res) => {
    try {
        const { title, description, image, originalPrice, discountedPrice, couponCode, buyLink } = req.body;
        console.log(title);

        const newDeal = new dealsModel({
            title: title,
            description: description,
            image: image,
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            couponCode: couponCode,
            buyLink: buyLink,
        });

        await newDeal.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to save deal');
    }

});

/* Display dealDetails page, which shows details of deal and have option to edit, delete deal */
router.get('/deal-details/:id', isAuthenticated, async (req, res) => {
    const dealId = req.params.id;
    console.log('deal id: ', dealId);
    const deal = await dealsModel.findById(req.params.id);
    res.render('dealDetails', { deal: deal });
});

/* Display editDeal page which has form to update the deal details */
router.get('/edit-deal/:id', isAuthenticated, async (req, res) => {
    try {
        const dealId = req.params.id;
        const deal = await dealsModel.findById(dealId);
        res.render('editDeal', { deal: deal });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }


});

/* Save the updated deal details to DB */
router.post('/update-deal/:id', isAuthenticated, async (req, res) => {
    try {
        const dealId = req.params.id;
        const deal = await dealsModel.findByIdAndUpdate(dealId, req.body);
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update deal');
    }

});

/* Delete the deal from DB */
router.post('/delete-deal/:id', isAuthenticated, async (req, res) => {
    try {
        const dealId = req.params.id;
        await dealsModel.findByIdAndDelete(dealId);
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete deal');
    }

});

function isAuthenticated(req, res, next) {
    console.log('Is authenticated? ', req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


module.exports = router;