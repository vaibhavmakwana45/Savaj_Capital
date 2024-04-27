// import axios from "axios";
// import { Flex, Table, Tbody, Text, Th, Thead, Tr, Td } from "@chakra-ui/react";
// import { IconButton } from "@chakra-ui/react";
// import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
// import React, { useEffect, useState } from "react";
// import Loader from "react-js-loader";

// const TableComponent = ({
//   data,
//   loading,
//   allHeaders,
//   handleDelete,
//   handleEdit,
//   handleRow,
// }) => {
//   return (
//     <Table variant="simple" color={"black"}>
//       <Thead>
//         <Tr my=".8rem" pl="0px" color="gray.400">
//           {allHeaders.map((header, index) => (
//             <Th key={index} pl="0px" borderColor={"gray.600"} color="gray.400">
//               {header}
//             </Th>
//           ))}
//         </Tr>
//       </Thead>
//       <Tbody>
//         {loading ? (
//           <Tr>
//             <Td colSpan={allHeaders.length} textAlign="center">
//               <Loader
//                 type="spinner-circle"
//                 bgColor={"#3182CE"}
//                 color={"black"}
//                 size={50}
//               />
//             </Td>
//           </Tr>
//         ) : data.length === 0 ? (
//           <Tr>
//             <Td colSpan={allHeaders.length} textAlign="center">
//               No Data found
//             </Td>
//           </Tr>
//         ) : (
//           data.map((rowData, rowIndex) => (
//             <Tr pl="0px" key={rowIndex}>
//               {rowData.slice(1).map((cellData, cellIndex) => (
//                 <Td
//                   style={{ cursor: "pointer" }}
//                   pl="0px"
//                   key={cellIndex}
//                   onClick={() => {
//                     handleRow(rowData[0]);
//                   }}
//                 >
//                   {cellData || "-"}
//                 </Td>
//               ))}
//               <Td pl="0px">
//                 <div>
//                   <IconButton
//                     aria-label="Delete bank"
//                     icon={<DeleteIcon />}
//                     onClick={() => handleDelete(rowData[0])}
//                     style={{ marginRight: 15 }}
//                   />

//                   <IconButton
//                     aria-label="Edit bank"
//                     icon={<EditIcon />}
//                     onClick={() => handleEdit(rowData[0])}
//                   />
//                 </div>
//               </Td>
//             </Tr>
//           ))
//         )}
//       </Tbody>
//     </Table>
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
  Button,
  Box,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  EditIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import Loader from "react-js-loader";

const TableComponent = ({
  data,
  loading,
  allHeaders,
  handleDelete,
  handleEdit,
  handleRow,
  itemsPerPage = 5,
}) => {
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pageCount = Math.ceil(data.length / itemsPerPage);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleRow = (rowIndex) => {
    setOpenRowIndex(openRowIndex === rowIndex ? null : rowIndex);
  };

  return (
    <Flex direction="column">
      <Table variant="simple" color={"black"}>
        <Thead>
          <Tr my=".8rem" pl="0px" color="gray.400">
            <Th pl="0px" borderColor={"gray.600"} color="gray.400"></Th>
            {allHeaders.map((header, index) => (
              <Th
                key={index}
                pl="0px"
                borderColor={"gray.600"}
                color="gray.400"
              >
                {header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan={allHeaders.length + 1} textAlign="center">
                <Loader
                  type="spinner-circle"
                  bgColor={"#3182CE"}
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
                <Tr pl="0px" cursor="pointer">
                  <Td style={{ cursor: "pointer" }} pl="0px">
                    <IconButton
                      aria-label="Toggle row"
                      icon={
                        openRowIndex === rowIndex ? (
                          <ChevronUpIcon />
                        ) : (
                          <ChevronDownIcon />
                        )
                      }
                      onClick={() => toggleRow(rowIndex)}
                    />
                  </Td>
                  {rowData.slice(1).map((cellData, cellIndex) => (
                    <Td
                      style={{ cursor: "pointer" }}
                      pl="0px"
                      key={cellIndex}
                      onClick={() => {
                        handleRow(rowData[0]);
                      }}
                    >
                      {cellData || "-"}
                    </Td>
                  ))}
                  <Td pl="0px">
                    <div>
                      <IconButton
                        aria-label="Delete bank"
                        icon={<DeleteIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(rowData[0]);
                        }}
                        style={{ marginLeft: 10 }}
                      />
                      <IconButton
                        aria-label="Edit bank"
                        icon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(rowData[0]);
                        }}
                        style={{ marginLeft: 10 }}
                      />
                    </div>
                  </Td>
                </Tr>
                {openRowIndex === rowIndex && (
                  <Tr>
                    <Td colSpan={allHeaders.length + 1}>Record Not Found</Td>
                  </Tr>
                )}
              </React.Fragment>
            ))
          )}
        </Tbody>
      </Table>
      <Box mt="4">
        {pageCount > 1 && (
          <Flex justify="space-between" m="4">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Text>{`Page ${currentPage} of ${pageCount}`}</Text>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              Next
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default TableComponent;
