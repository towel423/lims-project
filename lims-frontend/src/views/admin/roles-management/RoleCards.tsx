"use client";

// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import type { TypographyProps } from "@mui/material/Typography";
import type { CardProps } from "@mui/material/Card";

// Component Imports
import OpenDialogOnElementClick from "@components/dialogs/OpenDialogOnElementClick";
import Link from "@components/Link";
import { useRolesTable } from "../../../hooks/data/useRolesTable";
import { IRoles } from "../../../interface/admin/roles";
import RolesManagementRoleDialog from "./RoleDialog";
import { useRolesForm } from "../../../hooks/forms/admin/useRolesForm";
import { useRolesData } from "../../../hooks/data/useRolesData";

const RolesManagementRoleCards = () => {
  const { data } = useRolesData();
  const { setSelected } = useRolesForm();
  // Vars
  const typographyProps = (uuid: string): TypographyProps => ({
    children: "Edit Role",
    component: Link,
    color: "primary",
    onClick: e => {
      setSelected(uuid);
      e.preventDefault();
    },
  });

  const CardProps: CardProps = {
    className: "cursor-pointer bs-full",
    children: (
      <Grid container className="bs-full">
        <Grid item xs={5}>
          <div className="flex items-end justify-center bs-full">
            <img
              alt="add-role"
              src="/images/illustrations/characters/5.png"
              height={130}
            />
          </div>
        </Grid>
        <Grid item xs={7}>
          <CardContent>
            <div className="flex flex-col items-end gap-4 text-right">
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setSelected("");
                }}
              >
                Add Role
              </Button>
              <Typography>
                Add new role, <br />
                if it doesn&#39;t exist.
              </Typography>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    ),
  };

  return (
    <>
      <Grid container spacing={6}>
        {data?.map((item: IRoles, index: number) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start gap-1">
                    <Typography variant="h5">{item?.name}</Typography>
                    <OpenDialogOnElementClick
                      element={Typography}
                      elementProps={typographyProps(item?.uuid)}
                      dialog={RolesManagementRoleDialog}
                      dialogProps={{ title: item?.name }}
                    />
                  </div>
                  {/* <IconButton>
                    <i className="tabler-copy text-secondary" />
                  </IconButton> */}
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} lg={4}>
          <OpenDialogOnElementClick
            element={Card}
            elementProps={CardProps}
            dialog={RolesManagementRoleDialog}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default RolesManagementRoleCards;
