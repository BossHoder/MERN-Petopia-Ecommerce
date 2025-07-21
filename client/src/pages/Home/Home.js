import React from 'react';
import Layout from '../../layout/Layout';
import Hero from '../../components/Hero/Hero';
import CategoryCards from '../../components/CategoryCards/CategoryCards';
import BestsellerProducts from '../../components/BestsellerProducts/BestsellerProducts';
import BrandPromise from '../../components/BrandPromise/BrandPromise';
import Newsletter from '../../components/Newsletter/Newsletter';

const Home = () => {
    return (
        <Layout>
            <Hero />
            <CategoryCards />
            <BestsellerProducts />
            <BrandPromise />
            <Newsletter />
        </Layout>
    );
};

export default Home;
