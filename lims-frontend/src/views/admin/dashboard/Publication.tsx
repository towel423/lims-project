import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { usePublicationTable } from "../../../hooks/data/usePublicationData";
import { IPublication } from "../../../interface/admin/publication";
import { formatReadableDate } from "../../../helpers/helper";
import { usePublicationDetail } from "../../../hooks/data/usePublicationDetail";
import PublicationDetail from "./PublicationDetail";

export default function AdminDashboardPublication() {
  const { data, setPageSize } = usePublicationTable();
  useEffect(() => {
    setPageSize(3), [];
  });

  const { setOpen, setId } = usePublicationDetail();

  const handleShowDetail = (id: string) => {
    setId(id);
    setOpen(true);
  };
  return (
    <>
      <Grid container>
        {data?.data &&
          data?.data
          .filter((row: IPublication)  => row.status === "1")
          .map((row: IPublication) => (
            <Grid item width={"100%"} marginBottom={"1.5rem"} key={row.uuid}>
              <Card>
                <CardActionArea onClick={() => handleShowDetail(row.uuid!)}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={String(row.img)}
                    alt={row.title}
                  />
                  <CardContent>
                    <Grid container justifyContent={"space-between"}>
                      <Typography gutterBottom variant="h5" component="div">
                        {row.title}
                      </Typography>
                      <Typography variant={"subtitle1"}>
                        {formatReadableDate(row.created_at!)}
                      </Typography>
                    </Grid>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {row.caption}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
      <PublicationDetail />
    </>
  );
}
