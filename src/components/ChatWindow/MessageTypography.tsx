import React from "react";
import { Typography, TypographyProps } from "@mui/material";

const MessageTypography: React.FC<TypographyProps> = (props) => {
    return <Typography variant="body1" {...props} />;
};

export default MessageTypography;