export default function Contact() {
    return (
        <div className="flex flex-col justify-center items-center bg-white px-6 py-12 lg:px-8 w-full">
            <div className="mx-auto max-w-4xl w-full">

                {/* Titre */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Contact Us
                    </h2>
                    <p className="mt-4 text-lg leading-7 text-gray-600">
                        Have any questions? We’d love to hear from you.
                    </p>
                </div>

                {/* Infos centrées */}
                <div className="space-y-6 text-gray-700 text-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Our Office</h3>
                        <p>Lot Maatallah, Berradi II M'Hamid<br />Marrakesh 40000, Maroc</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                        <p>+212 6 51 92 53 98</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                        <p>contact@arganisme.com</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
                        <p>Monday – Saturday: 9h – 17h</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
