<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    protected $fillable = ['name'];

    public function product(){
        return $this->HasOne(Product::class);
    }
    //
}
