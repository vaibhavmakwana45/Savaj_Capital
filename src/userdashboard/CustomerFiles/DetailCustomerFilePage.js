import React, { useState, useEffect } from "react";
import "./userfile.scss";
import Loader from "react-js-loader";

import {
  useDisclosure,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Text,
  IconButton,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { saveAs } from "file-saver";

// FileDisplay component

const FileDisplay = ({ groupedFiles }) => {
  const basePath = "https://cdn.dohost.in/upload/";

  // Check if groupedFiles is undefined or null
  if (!groupedFiles || Object.keys(groupedFiles).length === 0) {
    return <div>No documents available</div>;
  }

  const handleDownload = async (filePath, fileName) => {
    try {
      const fileHandle = await window.showSaveFilePicker();
      const writableStream = await fileHandle.createWritable();

      const response = await fetch(filePath);
      const blob = await response.blob();

      await writableStream.write(blob);
      await writableStream.close();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-start image-responsive">
        {Object.entries(groupedFiles).map(([title, files], index) => (
          <div key={index} className="mx-3 mb-4 " style={{ flexBasis: "30%" }}>
            <h2
              className="my-4"
              style={{ fontSize: "20px", fontWeight: 700, color: "#333" }}
            >
              <u>
                {title} documents
              </u>
            </h2>
            {files.map((file, idx) => (
              <div key={idx} className="mb-3">
                <p className="mb-3">{file.document_name}</p>
                {file.file_path.endsWith(".pdf") ? (
                  <iframe
                    src={`${basePath}${file.file_path}`}
                    type="application/pdf"
                    width="100%"
                    height="260" // Adjust height as needed
                    style={{
                      border: "none",
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      borderRadius: "12px",
                    }}
                    title="PDF Viewer"
                  />
                ) : (
                  <img
                    src={`${basePath}${file.file_path}`}
                    alt={file.loan_document_id}
                    style={{
                      width: "100%",
                      height: "260px",
                      borderRadius: "12px",
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleDownload(
                        `${basePath}${file.file_path}`,
                        file.loan_document_id
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// const FileDisplay = ({ data }) => {
//   const basePath = "https://cdn.dohost.in/upload/";
//   const groupedFiles = data.reduce((acc, curr) => {
//     if (!acc[curr.loan_document]) {
//       acc[curr.loan_document] = [];
//     }
//     acc[curr.loan_document].push(curr);
//     return acc;
//   }, {});

//   const handleDownload = async (filePath, fileName) => {
//     try {
//       const fileHandle = await window.showSaveFilePicker();
//       const writableStream = await fileHandle.createWritable();

//       const response = await fetch(filePath);
//       const blob = await response.blob();

//       await writableStream.write(blob);
//       await writableStream.close();

//     } catch (error) {
//       console.error("Error downloading file:", error);
//     }
//   };

//   return (
//     <div>
//       <div className="d-flex flex-wrap justify-content-start image-responsive">
//         {Object.entries(groupedFiles).map(([title, files], index) => (
//           <div key={index} className="mx-3 mb-4 " style={{ flexBasis: "30%" }}>
//             <h2 className="my-4">
//               <i>{title}</i>
//             </h2>
//             {files.map((file, idx) => (
//               <div key={idx} className="d-flex mb-3">
//                 {file.file_path.endsWith(".pdf") ? (
//                   <iframe
//                     src={`${basePath}${file.file_path}`}
//                     type="application/pdf"
//                     width="100%"
//                     height="260" // Adjust height as needed
//                     style={{
//                       border: "none",
//                       boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
//                       borderRadius: "12px",
//                     }}
//                     title="PDF Viewer"
//                   />
//                 ) : (
//                   <img
//                     src={`${basePath}${file.file_path}`}
//                     alt={file.loan_document_id}
//                     style={{
//                       width: "100%",
//                       height: "260px",
//                       borderRadius: "12px",
//                       boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
//                       cursor: "pointer",
//                     }}
//                     onClick={() =>
//                       handleDownload(
//                         `${basePath}${file.file_path}`,
//                         file.loan_document_id
//                       )
//                     }
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

function DetailCustomerFilePage() {
  const textColor = useColorModeValue("gray.700", "white");
  const [users, setUsers] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const location = useLocation();
  const data = location.state;
  const history = useHistory();
  const [selectedLoanType, setSelectedLoanType] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = new URLSearchParams(location.search);

  const id = searchParams.get("id");

  const basePath = "https://cdn.dohost.in/upload/";

  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await AxiosInstance.get(
          "/file_upload/file_upload/" + id
        );
        setFileData(response.data.data.file);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      {loading ? (
        <Flex justify="center" align="center" height="100vh">
          <Loader
            type="spinner-circle"
            bgColor={"#3182CE"}
            color={"black"}
            size={50}
          />
        </Flex>
      ) : (
        // <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        //   <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
        //     <CardBody style={{ padding: "40px" }} className="cardss">
        //       <FormLabel className="mb-5" style={{ fontSize: "25px" }}>
        //         <IconButton
        //           icon={<ArrowBackIcon />}
        //           onClick={() => history.goBack()}
        //           aria-label="Back"
        //           mr="4"
        //         />
        //         <b>{fileData?.loan} File Details</b>
        //       </FormLabel>
        //       <div>
        //         <FormControl id="user_id" mt={4}>
        //           <div
        //             class="card"
        //             style={{
        //               borderRadius: "14px",
        //               boxShadow:
        //                 "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset",
        //             }}
        //           >
        //             <div
        //               class="card-header"
        //               style={{
        //                 fontSize: "20px",
        //                 backgroundColor: "#6AA3DA",
        //                 borderTopLeftRadius: "14px",
        //                 borderTopRightRadius: "14px",
        //                 color: "white",
        //               }}
        //             >
        //               {fileData?.loan} File -{fileData?.loan_type}
        //             </div>
        //             <u>
        //               <FormLabel
        //                 className="my-3"
        //                 style={{
        //                   fontSize: "18px",
        //                   paddingLeft: "20px",
        //                 }}
        //               >
        //                 <b>Loan User : {fileData?.username}</b>
        //               </FormLabel>
        //             </u>
        //             <div class="card-body">
        //               <blockquote class="blockquote mb-0">
        //                 <div class="card" style={{ marginTop: "-20px" }}>
        //                   <div class="card-body">
        //                     <blockquote class="blockquote mb-0">
        //                       <FormLabel
        //                         className="my-3 content"
        //                         style={{
        //                           fontSize: "18px",
        //                           paddingLeft: "20px",
        //                           justifyContent: "space-between",
        //                           display: "flex",
        //                         }}
        //                       >
        //                         <label>Branch UserName :</label>
        //                         <b> {fileData?.username}</b>
        //                       </FormLabel>
        //                       <FormLabel
        //                         className="my-3 content"
        //                         style={{
        //                           fontSize: "18px",
        //                           paddingLeft: "20px",
        //                           justifyContent: "space-between",
        //                           display: "flex",
        //                         }}
        //                       >
        //                         <label>Branch Name :</label>
        //                         <b> {fileData?.branch_name}</b>
        //                       </FormLabel>
        //                     </blockquote>
        //                   </div>
        //                 </div>
        //               </blockquote>
        //             </div>
        //           </div>
        //           <div>
        //             {fileData?.documents && (
        //               <FileDisplay data={fileData?.documents} />
        //             )}
        //           </div>
        //         </FormControl>
        //       </div>
        //     </CardBody>
        //   </Card>
        // </Flex>
        <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
          <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardBody style={{ padding: "40px" }} className="cardss">
              <FormLabel
                className="mb-2 back-responsive"
                style={{ fontSize: "25px" }}
              >
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => history.goBack()}
                  aria-label="Back"
                  mr="4"
                  className="icon-button"
                />
                <b>{fileData?.loan} File Details</b>
              </FormLabel>
              <div>
                <FormControl id="user_id" mt={4}>
                  <div
                    className="card"
                    style={{
                      borderRadius: "14px",
                      boxShadow:
                        "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset",
                    }}
                  >
                    <div
                      className="card-header"
                      style={{
                        fontSize: "20px",
                        backgroundColor: "#6AA3DA",
                        borderTopLeftRadius: "14px",
                        borderTopRightRadius: "14px",
                        color: "white",
                      }}
                    >
                      {fileData?.loan} File -{fileData?.loan_type}
                    </div>
                    <u>
                      <FormLabel
                        className="my-3"
                        style={{
                          fontSize: "18px",
                          paddingLeft: "20px",
                        }}
                      >
                        <b>Loan User : {fileData?.username}</b>
                      </FormLabel>
                    </u>
                    <div className="card-body">
                      <blockquote className="blockquote mb-0">
                        <div className="card" style={{ marginTop: "-20px" }}>
                          <div className="card-body card-bodyy">
                            <blockquote className="blockquote mb-0">
                              <FormLabel
                                className="my-3 content"
                                style={{
                                  fontSize: "18px",
                                  paddingLeft: "20px",
                                  justifyContent: "space-between",
                                  display: "flex",
                                }}
                              >
                                <label>Branch UserName :</label>
                                <b> {fileData?.username}</b>
                              </FormLabel>
                              <FormLabel
                                className="my-3 content"
                                style={{
                                  fontSize: "18px",
                                  paddingLeft: "20px",
                                  justifyContent: "space-between",
                                  display: "flex",
                                }}
                              >
                                <label>Branch Name:</label>
                                <b> {fileData?.branch_name}</b>
                              </FormLabel>
                            </blockquote>
                          </div>
                        </div>
                      </blockquote>
                    </div>
                  </div>
                  <div>
                    {/* {fileData?.documents && (
                      <FileDisplay data={fileData?.documents} />
                    )} */}
                    {fileData?.documents && (
                      <FileDisplay groupedFiles={fileData?.documents} />
                    )}
                  </div>
                </FormControl>
              </div>
            </CardBody>
          </Card>
        </Flex>
      )}
    </div>
  );
}

export default DetailCustomerFilePage;
