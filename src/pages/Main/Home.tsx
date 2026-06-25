// import { Link } from "react-router-dom";

import { useTitle } from "../../hooks/useTitle";

export default function Home () {
    useTitle("Home");

    return (
        <>
            This is home page
        </>
    )
}