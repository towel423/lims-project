'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { useForm, Controller } from 'react-hook-form'
import { ButtonGroup, CardHeader, MenuItem } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useParams, useRouter } from 'next/navigation'
import { useDetailDocumentControlStore, useDocumentStore } from '@/hooks/document/store'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { DocumentDetailField, FileMasterType } from '@/types/apps/documentTypes'
import { toast } from 'react-toastify'
import { indonesiaFormattedDate } from '@/helpers/helper'
import { can, view } from "@/helpers/permissionHelper";


type TabKeys = 'file-master';

type Props = {
    documentData?: FileMasterType,
    previewFileMaster: (url: string) => any
    controlledFileMaster: (url: string) => any
    uncontrolledFileMaster: (url: string) => any
};


const FileMaster = (props: Props) => {

    const {  previewFileMaster, controlledFileMaster, uncontrolledFileMaster } = props
    const fileMasterData = useDetailDocumentControlStore((state: any) => state.fileMaster);

    const { control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm<FileMasterType>({
        defaultValues: fileMasterData
    })

    const previewFile = async (url: string) => {
        try {
            let response = await previewFileMaster(url);
            if (response) {
                window.open(response, '_blank');
            } else {
                toast.error("Failed to preview file master!", {
                    position: "top-right",
                    autoClose: 2000
                });
            }
        } catch (error) {
            toast.error("Failed to preview file master!", {
                position: "top-right",
                autoClose: 2000
            });
        }
    }

    const controlledFile = async (url: string) => {
      try {
          let response = await controlledFileMaster(url);
          if (response) {
              window.open(response, '_blank');
          } else {
              toast.error("Failed to download file controlled!", {
                  position: "top-right",
                  autoClose: 2000
              });
          }
      } catch (error) {
          toast.error("Failed to download file controlled!", {
              position: "top-right",
              autoClose: 2000
          });
      }
  }

  const uncontrolledFile = async (url: string) => {
    try {
        let response = await uncontrolledFileMaster(url);
        if (response) {
            window.open(response, '_blank');
        } else {
            toast.error("Failed to download file controlled!", {
                position: "top-right",
                autoClose: 2000
            });
        }
    } catch (error) {
        toast.error("Failed to download file controlled!", {
            position: "top-right",
            autoClose: 2000
        });
    }
}

    useEffect(() => {
        reset(fileMasterData);
    }, [fileMasterData, reset]); 

    return (
        <Card>
            <CardHeader title={"File Master"} />
            <CardContent>
                <Grid container spacing={6}>
                    <Grid item xs={12} sm={6} marginBottom={4}>
                        <Controller
                            name="document_name"
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    value={field.value ?? ''}
                                    label="Dokumen"
                                />
                            )}
                            disabled={true}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} marginTop={5}>
                        <Button 
                            variant="contained" 
                            startIcon={<i className="tabler-eye" />} 
                            onClick={() => {
                                if (fileMasterData.url_file) {
                                previewFile(fileMasterData.url_file);
                                }
                            }}
                            >
                            Preview
                        </Button>

                    </Grid>
                    <Grid item xs={12} className='flex gap-4 flex-wrap'>
                    {fileMasterData.casbin_check.owner == true || view(fileMasterData.casbin_check.rule, fileMasterData.casbin_check.action, fileMasterData.casbin_check.catPrefix, fileMasterData.casbin_check.typePrefix, fileMasterData.casbin_check.docID) && (
                     <ButtonGroup variant='contained'>
                     <Button className='mr-2' startIcon={<i className='tabler-download'/>}
                      onClick={() => {
                           if (fileMasterData.url_file) {
                           controlledFile(fileMasterData.url_file);
                           }
                       }}
                     >Download Controlled</Button>
                     <Button endIcon={<i className='tabler-download'/>}
                     onClick={() => {
                       if (fileMasterData.url_file) {
                       uncontrolledFile(fileMasterData.url_file);
                       }
                   }}
                     >Download Uncontrolled</Button>
                 </ButtonGroup>
                    )}
                      {/* {view(fileMasterData.casbin_check.rule, fileMasterData.casbin_check.action, fileMasterData.casbin_check.catPrefix, fileMasterData.casbin_check.typePrefix, fileMasterData.casbin_check.docID) && (
                        <ButtonGroup variant='contained'>
                            <Button className='mr-2' startIcon={<i className='tabler-download'/>}
                             onClick={() => {
                                  if (fileMasterData.url_file) {
                                  controlledFile(fileMasterData.url_file);
                                  }
                              }}
                            >Download Controlled</Button>
                            <Button endIcon={<i className='tabler-download'/>}
                            onClick={() => {
                              if (fileMasterData.url_file) {
                              uncontrolledFile(fileMasterData.url_file);
                              }
                          }}
                            >Download Uncontrolled</Button>
                        </ButtonGroup>
                      )} */}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default FileMaster;
