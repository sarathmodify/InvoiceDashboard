'use server';
import {z} from 'zod'; 
import postgres from 'postgres'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DeleteInvoice } from '../ui/invoices/buttons';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  const FormSchema = z.object({
        id : z.string().optional(),
        customerId: z.string().min(1),
        amount : z.coerce.number(),
        status : z.enum(['pending','paid']),
        data : z.string().optional(),
    })
    const DeleteSchema = z.object({
      id : z.string().min(1)
    })

export async function createInvoice(formData: FormData) {
                          
 const {customerId,amount,status} = FormSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'), 
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  await sql `INSERT INTO invoices (customer_id,amount,status,date) VALUES 
   (${customerId},${amountInCents},${status},${date})`;
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id:string,formData: FormData) {
    const {customerId,amount,status} = FormSchema.parse({
       customerId: formData.get('customerId'),
       amount: formData.get('amount'),
       status: formData.get('status'), 
     });
     const amountInCents = amount * 100;
     await sql `UPDATE invoices SET customer_id=${customerId}, amount=${amountInCents},
      status=${status} WHERE id=${id}`;
       revalidatePath('/dashboard/invoices');
       redirect('/dashboard/invoices');
}

export async function deleteInvoice(id :string) {
    // const {id} = DeleteSchema.parse({
    //     id  : formData.get('deleteInvoice')
    // });
    await sql `DELETE FROM invoices WHERE id=${id}`;
    revalidatePath('/dashboard/invoices');
}