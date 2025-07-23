import React from 'react';
import Hero from '../../components/Hero/Hero';
import CategoryCards from '../../components/CategoryCards/CategoryCards';
import BestsellerProducts from '../../components/BestsellerProducts/BestsellerProducts';
import BrandPromise from '../../components/BrandPromise/BrandPromise';
import Newsletter from '../../components/Newsletter/Newsletter';

const Home = () => {
    return (
        <>
            <Hero />
            <CategoryCards />
            <BestsellerProducts />
            <BrandPromise />
            <Newsletter />
        </>
    );
};

export default Home;
