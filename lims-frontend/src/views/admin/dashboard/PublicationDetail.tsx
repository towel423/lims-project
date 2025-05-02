import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Modal,
  Typography,
} from "@mui/material";
import React from "react";
import { usePublicationDetail } from "../../../hooks/data/usePublicationDetail";
import { formatReadableDate } from "../../../helpers/helper";
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export default function PublicationDetail() {
  const { open, setOpen, data } = usePublicationDetail();
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
    >
      <Box sx={style}>
        <Card>
          <CardMedia
            component="img"
            height="140"
            image={String(data?.img)}
            alt={data?.title}
          />
          <CardContent
            sx={{
              maxHeight: 400, // Set the maximum height
              overflow: "auto", // Enable scrolling
            }}
          >
            <Grid container justifyContent={"space-between"}>
              <Typography gutterBottom variant="h5" component="div">
                {data?.title}
              </Typography>
              <Typography variant={"subtitle1"}>
                {formatReadableDate(data?.created_at!)}
              </Typography>
            </Grid>
            <div dangerouslySetInnerHTML={{ __html: data?.description }}></div>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );
}
