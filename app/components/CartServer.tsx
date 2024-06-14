import React from 'react'
import Cart from './Cart'
import getStripe from '@/lib/getStripe';
import toast from 'react-hot-toast';
import { client } from '@/lib/client';
import { Product as ProductType } from '@/types/product';
import { groq } from 'next-sanity';

const CartServer = () => {


  const updateProductQty = (id, operation, value) => {
    let patch = null;
    if (operation === 'inc') {
      patch = client.patch(id).inc({ availableQty: value }).commit();
    } else if (operation === 'dec') {
      patch = client.patch(id).dec({ availableQty: Math.max(value, 0) }).commit();
    }
    patch.then((updatedDoc) => {
      console.log('Document updated successfully:', updatedDoc);
    })
      .catch((error) => {
        console.error('Error patching document:', error);
      });
  }

  const handleCheckout = async (cartItems) => {
    try {
      const stripe = await getStripe();
    const checkoutResponse = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cartItems)
    });
    cartItems.map((i)=>{
      updateProductQty(i._id, 'dec', i.quantity);
    });
    const id = await checkoutResponse.json();
    stripe?.redirectToCheckout({sessionId: id});
    } catch (error) {
      console.log(error);
    }
    
  }
  return (
    <>
      <Cart handleCheckout={handleCheckout} updateProductQty={updateProductQty} />
    </>
  )
}

export default CartServer