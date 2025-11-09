import Services from "../../components/HomePage/Services.tsx";
import WhyUs from "../../components/HomePage/WhyUs.tsx";
import Organisations from "../../components/HomePage/Organisations.tsx";
import Label from "../../components/HomePage/Label.tsx";
import ArganQuality from "../../components/HomePage/ArganQuality.tsx";
import AboutHomePage from "../../components/HomePage/AboutHomePage.tsx";
import ProductsAds from "../../components/Product/ProductAdsComponent.tsx";
import {useEffect} from "react";
import {useLocation} from "react-router-dom";

export default function Home() {
    const location = useLocation();

    useEffect(() => {
        const scrollToId = location.state?.scrollToId;
        if (scrollToId) {
            const el = document.getElementById(scrollToId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location.state]);

    return (
        <div className="flex flex-col gap-0 ">
            <Services />
            <AboutHomePage />
            <ProductsAds />
            <div id="arganquality">
                <ArganQuality />
            </div>
            <WhyUs />
            <Organisations />
            <Label />
        </div>
            )
}
