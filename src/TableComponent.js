// import React, { useState } from "react";
// import {
//   Flex,
//   Table,
//   Tbody,
//   Text,
//   Th,
//   Thead,
//   Tr,
//   Td,
//   IconButton,
//   Select,
//   Button,
// } from "@chakra-ui/react";
// import Loader from "react-js-loader";
// import {
//   DeleteIcon,
//   EditIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   AddIcon, // Added new icon here
// } from "@chakra-ui/icons";

// const Pagination = ({
//   currentPage,
//   totalPages,
//   handlePageChange,
//   previousPage,
//   nextPage,
// }) => {
//   return (
//     <Flex justify="space-between" align="center" p="0.5rem">
//       <Text>
//         Page {currentPage} of {totalPages}
//       </Text>
//       <Flex align="center">
//         <IconButton
//           aria-label="Previous Page"
//           icon={<ChevronLeftIcon />}
//           onClick={previousPage}
//           disabled={currentPage === 1}
//           mr={2}
//         />
//         <IconButton
//           aria-label="Next Page"
//           icon={<ChevronRightIcon />}
//           onClick={nextPage}
//           disabled={currentPage === totalPages}
//         />
//       </Flex>
//     </Flex>
//   );
// };

// const TableComponent = ({
//   data,
//   loading,
//   allHeaders,
//   handleDelete,
//   handleEdit,
//   handleRow,
//   handleTitle,
//   handleActivate, // Function to activate a user
//   handleDeactivate, // Function to deactivate a user
//   showActivationButtons = false,
//   showDeleteButton = true,
//   showTitleButton = false,
//   showEditButton = true,
//   collapse = false,
//   removeIndex,
//   documentIndex,
//   name,
//   removeIndex2,
//   documentIndex2,
//   name2,
//   itemsPerPageOptions = [10, 20, 50],
//   showPagination = false, // Option to show pagination dynamically
// }) => {
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

//   const toggleRow = (rowIndex) => {
//     const index = expandedRows.indexOf(rowIndex);
//     if (index === -1) {
//       setExpandedRows([...expandedRows, rowIndex]);
//     } else {
//       setExpandedRows(expandedRows.filter((row) => row !== rowIndex));
//     }
//   };

//   const totalPages = Math.ceil(data.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = Math.min(startIndex + itemsPerPage, data.length);
//   const currentData = data.slice(startIndex, endIndex);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const previousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handleItemsPerPageChange = (value) => {
//     setItemsPerPage(value);
//     setCurrentPage(1);
//   };

//   return (
//     <div style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" ,padding:0}}>
//       <Table variant="simple" color={"black"}>
//         <Thead>
//           <Tr my=".8rem" pl="0px" color="gray.400">
//             {allHeaders.map((header, index) => (
//               <Th
//                 key={index}
//                 pl="0px"
//                 borderColor={"gray.600"}
//                 color="gray.400"
//                 display={
//                   index === removeIndex || index === removeIndex2
//                     ? "none"
//                     : "table-cell"
//                 }
//               >
//                 {header}
//               </Th>
//             ))}
//             <Th></Th>
//           </Tr>
//         </Thead>
//         <Tbody>
//           {loading ? (
//             <Tr>
//               <Td colSpan={allHeaders.length + 1} textAlign="center">
//                 <Loader
//                   type="spinner-circle"
//                   bgColor={"#b19552"}
//                   color={"black"}
//                   size={50}
//                 />
//               </Td>
//             </Tr>
//           ) : currentData.length === 0 ? (
//             <Tr>
//               <Td colSpan={allHeaders.length + 1} textAlign="center">
//                 No Data found
//               </Td>
//             </Tr>
//           ) : (
//             currentData.map((rowData, rowIndex) => (
//               <React.Fragment key={rowIndex}>
//                 <Tr pl="0px">
//                   {rowData.slice(1).map((cellData, cellIndex) => (
//                     <Td
//                       key={cellIndex}
//                       pl="0px"
//                       onClick={() => handleRow(rowData[0])}
//                       style={{ cursor: handleRow ? "pointer" : "auto" }}
//                       display={
//                         cellIndex === removeIndex || cellIndex === removeIndex2
//                           ? "none"
//                           : "table-cell"
//                       }
//                     >
//                       {cellData || "-"}
//                     </Td>
//                   ))}
//                   <Td pl="0px">
//                     <Flex alignItems="center">
//                       {showDeleteButton && (
//                         <IconButton
//                           aria-label="Delete"
//                           icon={<DeleteIcon />}
//                           onClick={() => handleDelete(rowData[0])}
//                           mr={2}
//                         />
//                       )}
//                       {showEditButton && (
//                         <IconButton
//                           aria-label="Edit"
//                           icon={<EditIcon />}
//                           onClick={() => handleEdit(rowData[0])}
//                         />
//                       )}
//                       {collapse && (
//                         <IconButton
//                           aria-label="Toggle"
//                           icon={
//                             expandedRows.includes(rowIndex) ? (
//                               <ChevronUpIcon />
//                             ) : (
//                               <ChevronDownIcon />
//                             )
//                           }
//                           onClick={() => toggleRow(rowIndex)}
//                           ml={2}
//                         />
//                       )}
//                       {showTitleButton && (
//                         <IconButton
//                           aria-label="Title"
//                           icon={<AddIcon />}
//                           ml={2}
//                           onClick={() => handleTitle(rowData[0])}
//                         />
//                       )}
//                       {showActivationButtons && (
//                         <>
//                           <Button
//                             colorScheme="green"
//                             onClick={() => handleActivate(rowData[0])}
//                             ml={2}
//                           >
//                             Activate
//                           </Button>
//                           <Button
//                             colorScheme="red"
//                             onClick={() => handleDeactivate(rowData[0])}
//                             ml={2}
//                           >
//                             Deactivate
//                           </Button>
//                         </>
//                       )}
//                     </Flex>
//                   </Td>
//                 </Tr>
//                 {name && collapse && expandedRows.includes(rowIndex) && (
//                   <>
//                     <Tr>
//                       <Td colSpan={allHeaders.length + 1}>
//                         <Text fontWeight="bold">{name}</Text>
//                         <ul>
//                           {rowData[documentIndex]
//                             .split(",")
//                             .map((name, index) => (
//                               <li key={index}>{name}</li>
//                             ))}
//                         </ul>
//                       </Td>
//                     </Tr>
//                   </>
//                 )}
//                 {name2 && collapse && expandedRows.includes(rowIndex) && (
//                   <>
//                     <Tr>
//                       <Td colSpan={allHeaders.length + 1}>
//                         <Text fontWeight="bold">{name2}</Text>
//                         <ul>
//                           {rowData[documentIndex2]
//                             .split(", ")
//                             .map((name2, index) => (
//                               <li key={index}>{name2}</li>
//                             ))}
//                         </ul>
//                       </Td>
//                     </Tr>
//                   </>
//                 )}
//               </React.Fragment>
//             ))
//           )}
//         </Tbody>
//       </Table>

//       {showPagination && (
//         <div
//           className="text-end"
//           style={{ display: "flex", justifyContent: "end" }}
//         >
//           <div
//             className="card text-center"
//             style={{
//               width: "30%",
//               display: "flex",
//               justifyContent: "center",
//               padding: "10px",
//               borderRadius: "10px",
//               boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
//               marginBottom: "40px",
//               marginTop: "20px",
//               marginRight: "20px",
//             }}
//           >
//             <Flex
//               justify="space-between"
//               align="center"
//               p="0.5rem"
//               style={{ gap: "20px" }}
//             >
//               <Text>
//                 {startIndex + 1}-{endIndex} of {data.length}
//               </Text>
//               <Flex align="center">
//                 <Select
//                   value={itemsPerPage}
//                   onChange={(e) =>
//                     handleItemsPerPageChange(parseInt(e.target.value))
//                   }
//                   variant="filled"
//                   mr="1rem"
//                 >
//                   {itemsPerPageOptions.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </Select>
//                 <IconButton
//                   aria-label="Previous Page"
//                   icon={<ChevronLeftIcon />}
//                   onClick={previousPage}
//                   disabled={currentPage === 1}
//                   mr={2}
//                 />
//                 <IconButton
//                   aria-label="Next Page"
//                   icon={<ChevronRightIcon />}
//                   onClick={nextPage}
//                   disabled={currentPage === totalPages}
//                 />
//               </Flex>
//             </Flex>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TableComponent;

import React, { useState } from "react";
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  IconButton,
  Select,
  Button,
} from "@chakra-ui/react";
import Loader from "react-js-loader";
import {
  DeleteIcon,
  EditIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AddIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
const Pagination = ({
  currentPage,
  totalPages,
  handlePageChange,
  previousPage,
  nextPage,
}) => {
  return (
    <Flex justify="space-between" align="center" p="0.5rem">
      <Text>
        Page {currentPage} of {totalPages}
      </Text>
      <Flex align="center">
        <IconButton
          aria-label="Previous Page"
          icon={<ChevronLeftIcon />}
          onClick={previousPage}
          disabled={currentPage === 1}
          mr={2}
        />
        <IconButton
          aria-label="Next Page"
          icon={<ChevronRightIcon />}
          onClick={nextPage}
          disabled={currentPage === totalPages}
        />
      </Flex>
    </Flex>
  );
};

const TableComponent = ({
  data,
  loading,
  allHeaders,
  handleDelete,
  handleEdit,
  handleRow,
  handleTitle,
  handleActivate,
  handleDeactivate,
  showActivationButtons = false,
  showDeleteButton = true,
  showTitleButton = false,
  showEditButton = true,
  collapse = false,
  removeIndex,
  documentIndex,
  name,
  removeIndex2,
  documentIndex2,
  name2,
  itemsPerPageOptions = [10, 20, 50],
  showPagination = false,
  myData,
}) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

  const toggleRow = (rowIndex) => {
    const index = expandedRows.indexOf(rowIndex);
    if (index === -1) {
      setExpandedRows([...expandedRows, rowIndex]);
    } else {
      setExpandedRows(expandedRows.filter((row) => row !== rowIndex));
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <>
      <div
        style={{
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          padding: 0,
          overflow: "auto",
        }}
      >
        <Table variant="simple" color={"black"}>
          <Thead>
            <Tr my=".8rem" pl="0px" color="gray.400">
              {allHeaders.map((header, index) => (
                <Th
                  key={index}
                  pl="10px"
                  borderColor={"gray.600"}
                  display={
                    index === removeIndex || index === removeIndex2
                      ? "none"
                      : "table-cell"
                  }
                >
                  {header}
                </Th>
              ))}
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={allHeaders.length + 1} textAlign="center">
                  <Loader
                    type="spinner-circle"
                    bgColor={"#b19552"}
                    color={"black"}
                    size={50}
                  />
                </Td>
              </Tr>
            ) : currentData.length === 0 ? (
              <Tr>
                <Td colSpan={allHeaders.length + 1} textAlign="center">
                  No Data found
                </Td>
              </Tr>
            ) : (
              currentData.map((rowData, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <Tr
                    pl="0px"
                    _hover={{
                      background: "#b19552",
                      cursor: "pointer",
                      textColor: "white",
                    }}
                  >
                    {rowData.slice(1).map((cellData, cellIndex) => (
                      <Td
                        key={cellIndex}
                        pl="10px"
                        onClick={() => handleRow(rowData[0])}
                        _hover={{ background: "#b19552", cursor: "pointer" }}
                        style={{ cursor: handleRow ? "pointer" : "auto" }}
                        display={
                          cellIndex === removeIndex ||
                          cellIndex === removeIndex2
                            ? "none"
                            : "table-cell"
                        }
                      >
                        {cellData || "-"}
                      </Td>
                    ))}
                    <Td pl="0px">
                      <Flex alignItems="center">
                        {showDeleteButton && (
                          <IconButton
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                            onClick={() => handleDelete(rowData[0])}
                            mr={2}
                            color="black"
                          />
                        )}

                        {showEditButton && (
                          <IconButton
                            aria-label="Edit"
                            icon={<EditIcon />}
                            onClick={() => handleEdit(rowData[0])}
                            color="black"
                          />
                        )}
                        {collapse && (
                          <IconButton
                            aria-label="Toggle"
                            icon={
                              expandedRows.includes(rowIndex) ? (
                                <ChevronUpIcon />
                              ) : (
                                <ChevronDownIcon />
                              )
                            }
                            onClick={() => toggleRow(rowIndex)}
                            ml={2}
                            color="black"
                          />
                        )}
                        {showTitleButton && (
                          <IconButton
                            aria-label="Title"
                            icon={<AddIcon />}
                            ml={2}
                            onClick={() => handleTitle(rowData[0])}
                            color="black"
                          />
                        )}
                        {showActivationButtons && (
                          <>
                            <Button
                              colorScheme="green"
                              onClick={() => handleActivate(rowData[0])}
                              ml={2}
                            >
                              Activate
                            </Button>
                            <Button
                              colorScheme="red"
                              onClick={() => handleDeactivate(rowData[0])}
                              ml={2}
                            >
                              Deactivate
                            </Button>
                          </>
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                  {myData && collapse && expandedRows.includes(rowIndex) && (
                    <Tr>
                      <Td colSpan={allHeaders.length + 1}>
                        <Table variant="simple" color={"black"} width="100%">
                          <Thead>
                            <Tr>
                              {Object.entries(myData[rowIndex][0]).map(
                                ([key, value]) => (
                                  <Th style={{ fontSize: "12px" }}>{key}</Th>
                                )
                              )}
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              {Object.entries(myData[rowIndex][0]).map(
                                ([key, value]) => (
                                  <Td style={{ fontSize: "12px" }}>{value}</Td>
                                )
                              )}
                            </Tr>
                          </Tbody>
                        </Table>
                      </Td>
                    </Tr>
                  )}
                  {name && collapse && expandedRows.includes(rowIndex) && (
                    <>
                      <Tr>
                        <Td colSpan={allHeaders.length + 1}>
                          <Text fontWeight="bold">{name}</Text>
                          <ul>
                            {rowData[documentIndex]
                              .split(",")
                              .map((name, index) => (
                                <li key={index}>{name}</li>
                              ))}
                          </ul>
                        </Td>
                      </Tr>
                    </>
                  )}
                  {name2 && collapse && expandedRows.includes(rowIndex) && (
                    <>
                      <Tr>
                        <Td colSpan={allHeaders.length + 1}>
                          <Text fontWeight="bold">{name2}</Text>
                          <ul>
                            {rowData[documentIndex2]
                              .split(", ")
                              .map((name2, index) => (
                                <li key={index}>{name2}</li>
                              ))}
                          </ul>
                        </Td>
                      </Tr>
                    </>
                  )}
                </React.Fragment>
              ))
            )}
          </Tbody>
        </Table>
      </div>
      {showPagination && (
        <Flex
          justifyContent="flex-end"
          alignItems="center"
          p="4"
          // borderBottom="1px solid #ccc"
        >
          <Text mr="4" fontSize="sm">
            Total Records: {data.length}
          </Text>
          <Text mr="2" fontSize="sm">
            Rows per page:
          </Text>
          <Select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            mr="2"
            width="100px"
            fontSize="sm"
          >
            {[10, 20, 50].map((perPage) => (
              <option key={perPage} value={perPage}>
                {perPage}
              </option>
            ))}
          </Select>
          <Text mr="4" fontSize="sm">
            Page {currentPage} of {totalPages}
          </Text>
          <IconButton
            onClick={previousPage}
            disabled={currentPage === 1}
            aria-label="Previous Page"
            icon={<KeyboardArrowUpIcon />}
            mr="2"
            variant="outline"
            colorScheme="gray"
            size="sm"
          />
          <IconButton
            onClick={nextPage}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
            icon={<KeyboardArrowDownIcon />}
            variant="outline"
            colorScheme="gray"
            size="sm"
          />
        </Flex>
      )}
    </>
  );
};

export default TableComponent;
