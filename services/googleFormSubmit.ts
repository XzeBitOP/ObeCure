
export interface UserData {
  patientName?: string;
  age?: string;
  sex?: string;
  phone?: string;
  patientWeight?: string;
}

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdrnNNuQ7QCD9y8umoFQzZEMfrKuYUn3olwSN1raZH0yZh_8A/formResponse';

const FORM_ENTRIES = {
  name: 'entry.464267730',
  age: 'entry.343891540',
  sex: 'entry.1030959717',
  phone: 'entry.581473341',
  weight: 'entry.772259429',
};

export const submitToGoogleForm = async (data: UserData): Promise<void> => {
  const formData = new FormData();
  if (data.patientName) formData.append(FORM_ENTRIES.name, data.patientName);
  if (data.age) formData.append(FORM_ENTRIES.age, data.age);
  if (data.sex) formData.append(FORM_ENTRIES.sex, data.sex);
  if (data.phone) formData.append(FORM_ENTRIES.phone, data.phone);
  if (data.patientWeight) formData.append(FORM_ENTRIES.weight, data.patientWeight);

  try {
    await fetch(FORM_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // Important: Google Forms doesn't support CORS
    });
    console.log('User data submitted to Google Form.');
  } catch (error) {
    console.error('Error submitting data to Google Form:', error);
  }
};
