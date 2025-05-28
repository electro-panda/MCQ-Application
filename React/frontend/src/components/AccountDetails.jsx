// export default function AccountDetails() {
//     return (
//         <>
//             <div>
//                 <table>
//                     <tr><th>Username:</th><td>Sujal</td></tr>
//                     <tr><th>Roll no.:</th><td>22914</td></tr>
//                     <tr><th>E-mail:</th><td>sujalnasa13@gmail.com</td></tr>
//                     <tr><th>Role:</th><td>student</td></tr>
//                 </table>
//             </div>
//         </>
//     )
// }

export default function AccountInfoTable({ details }) {
    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-3xl text-center font-bold">Account Details</h1>
            <table className="w-full text-left border-separate border-spacing-y-2 mt-5">
                <tbody>
                    <tr>
                        <th className="text-gray-600 pr-4 align-top">Username:</th>
                        <td className="border-b border-gray-200 py-2">{details.username}</td>
                    </tr>
                    <tr>
                        <th className="text-gray-600 pr-4 align-top">Roll no.:</th>
                        <td className="border-b border-gray-200 py-2">{details.rollno}</td>
                    </tr>
                    <tr>
                        <th className="text-gray-600 pr-4 align-top">E-mail:</th>
                        <td className="border-b border-gray-200 py-2">{details.email}</td>
                    </tr>
                    <tr>
                        <th className="text-gray-600 pr-4 align-top">Role:</th>
                        <td className="border-b border-gray-200 py-2">{details.role}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
