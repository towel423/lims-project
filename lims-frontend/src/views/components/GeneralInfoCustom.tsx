import Grid from '@mui/material/Grid';
import { Button, Card, CardContent, CardHeader } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { ProvinceType } from '@/types/apps/provinceTypes';

type Props = {
  formTitle: string;
  backUrl: string;
  successMessage: string;
  failedMessage: string;
  actionMethod: (data: any) => Promise<{ status: number; message: string } | undefined>;
  children?: React.ReactNode;
};

const GeneralInfoCustom = ({ formTitle, actionMethod, backUrl, children, successMessage, failedMessage }: Props) => {
  const router = useRouter();
  const params = useParams();
  const { lang: locale } = params;

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()); 

    const response = await actionMethod(data);
    if (response?.status === 201) {
      toast.success(successMessage, { autoClose: 2000, onClose: () => router.push(`/${locale}${backUrl}`) });
    } else {
      toast.error(response?.message ?? failedMessage, { autoClose: 2000, onClose: () => router.push(`/${locale}${backUrl}`) });
    }
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={formTitle} subheader="General Info" />
          <CardContent>
            <form onSubmit={handleSave}>
              {children}
              <Grid item xs={12} className="flex gap-4 flex-wrap">
                <Button variant="contained" type="submit">
                  Save
                </Button>
                <Button
                  variant="outlined"
                  type="reset"
                  color="secondary"
                  onClick={() => router.push(`/${locale}${backUrl}`)}
                >
                  Back
                </Button>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default GeneralInfoCustom;
