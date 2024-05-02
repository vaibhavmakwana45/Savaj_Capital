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
  showDeleteButton = true,
  showEditButton = true,
  collapse = false,
  documentIndex = -1,
}) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (rowIndex) => {
    const index = expandedRows.indexOf(rowIndex);
    if (index === -1) {
      setExpandedRows([...expandedRows, rowIndex]);
    } else {
      setExpandedRows(expandedRows.filter((row) => row !== rowIndex));
    }
  };

  return (
    <Table variant="simple" color={"black"}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          {allHeaders.map(
            (header, index) =>
              index !== 1 && (
                <Th
                  key={index}
                  pl="0px"
                  borderColor={"gray.600"}
                  color="gray.400"
                >
                  {header}
                </Th>
              )
          )}
          <Th></Th>
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
        ) : data.length === 0 ? (
          <Tr>
            <Td colSpan={allHeaders.length + 1} textAlign="center">
              No Data found
            </Td>
          </Tr>
        ) : (
          data.map((rowData, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <Tr pl="0px">
                {rowData.slice(1).map(
                  (cellData, cellIndex) =>
                    cellIndex !== 1 && (
                      <Td
                        key={cellIndex}
                        pl="0px"
                        onClick={() => handleRow(rowData[0])}
                        style={{ cursor: handleRow ? "pointer" : "auto" }}
                      >
                        {cellData || "-"}
                      </Td>
                    )
                )}
                <Td pl="0px">
                  <Flex alignItems="center">
                    {showDeleteButton && (
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        onClick={() => handleDelete(rowData[0])}
                        mr={2}
                      />
                    )}
                    {showEditButton && (
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        onClick={() => handleEdit(rowData[0])}
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
                      />
                    )}
                  </Flex>
                </Td>
              </Tr>
              {collapse &&
                expandedRows.includes(rowIndex) &&
                documentIndex !== -1 && (
                  <Tr>
                    <Td colSpan={allHeaders.length + 1}>
                      <Text fontWeight="bold">Document Names:</Text>
                      <ul>
                        {rowData[documentIndex]
                          .split(", ")
                          .map((name, index) => (
                            <li key={index}>{name}</li>
                          ))}
                      </ul>
                    </Td>
                  </Tr>
                )}
            </React.Fragment>
          ))
        )}
      </Tbody>
    </Table>
  );
};

export default TableComponent;
