import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "theDhakaShop. - Store Dashboard",
    description: "theDhakaShop. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
