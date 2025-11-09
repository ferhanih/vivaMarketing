<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
//    public function __construct(){
//        $this->middleware('auth:api');
//    }

    public function update(Request $request, $id){
//        $this->authorize('update', OrderItem::class);

        $orderItems = OrderItem::findOrFail($id);
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:1',
        ]);

        $orderItems->update($validated);
        return response()->json([$orderItems]);
    }

}
