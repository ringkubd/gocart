import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "theDhakaShop. - Admin",
    description: "theDhakaShop. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
