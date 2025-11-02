'use server';
import {z} from 'zod'; 
import postgres from 'postgres'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DeleteInvoice } from '../ui/invoices/buttons';
import { ca } from 'zod/v4/locales';
import { error } from 'console';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  const FormSchema = z.object({
        id : z.string().optional(),
        customerId: z.string({
          invalid_type_error: 'Customer is required',
        }).min(1),
        amount : z.coerce.number().gt(0,{
          message : 'Amount must be greater than zero'
        }),
        status : z.enum(['pending','paid'],{
          invalid_type_error : 'Status is required'
        }),
        data : z.string().optional(),
    })
    const DeleteSchema = z.object({
      id : z.string().min(1)
    })

export type State = {
   errors : {
    customerId?: string[],
    amount?: string[],
    status?: string[]
   },
   message : string | null,
}

export async function createInvoice(prevState : State,formData: FormData) : Promise<State> {
                          
 const validatedFields = FormSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'), 
  });

  if(!validatedFields.success){
    return {
      errors : validatedFields.error.flatten().fieldErrors,
      message : 'Missing fields. Failed to create invoice'
    }
  }

  const {customerId,amount,status} = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try{
    await sql `INSERT INTO invoices (customer_id,amount,status,date) VALUES 
   (${customerId},${amountInCents},${status}  ,${date})`;
  }catch(error){
   console.error("Error when creating invoice:",error)
   return {
    errors: {},
    message : 'Database eror: failed to create invoice', 
   }
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(prevState : State ,formData: FormData) : Promise<State> {
    const validatedFields = FormSchema.safeParse({
       customerId: formData.get('customerId'),
       amount: formData.get('amount'),
       status: formData.get('status'), 
     });
      if(!validatedFields.success){   
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message : 'Missing fields. Failed to update invoice'
        }
      }
      const {customerId,amount,status} = validatedFields.data;
     const id  = formData.get('invoiceId') as string;
          if(!id){
              throw new Error('Invoice Id is required');
          }
      console.log(id,'invoice id in action');
     const amountInCents = amount * 100;
     try{
        await sql `UPDATE invoices SET customer_id=${customerId}, amount=${amountInCents},
                   status=${status} WHERE id=${id}`;
     }
     catch(error){
      console.error("Error when updating invoice:",error)
      return {
        errors: {},
       message : 'Database eror: failed to update invoice'
      }
     }
       revalidatePath('/dashboard/invoices');
       redirect('/dashboard/invoices');
}

export async function deleteInvoice(id :string) {
    // throw new Error('Delete is not mactched');
    await sql `DELETE FROM invoices WHERE id=${id}`;
    revalidatePath('/dashboard/invoices');
}