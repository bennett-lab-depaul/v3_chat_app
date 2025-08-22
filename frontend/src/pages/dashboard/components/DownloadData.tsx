import { downloadData } from "@/api";
import { useAuth } from "@/context/AuthProvider";
import { useDownload } from "@/hooks/queries/useDownload";

export function DownloadData() {
    const { profile         } = useAuth();

    const download = async () => {
        const { fileName, fileContents } = await downloadData();
        // console.log(download)
        // Create a temporary link element
        const link = document.createElement('a');
        const blob = new Blob([fileContents], { type: 'text/plain' });
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        // Programmatically click the link to trigger the download
        link.click();

        // Clean up the URL object
        URL.revokeObjectURL(link.href);
    }

    return (
        <button className="p4 m4" onClick={() => download()}>
            Download Data
        </button>
    )
    
}