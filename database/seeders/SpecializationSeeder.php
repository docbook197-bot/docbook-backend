<?php

namespace Database\Seeders;

use App\Models\Specialization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SpecializationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specializations = [
            ['name' => 'Cardiology', 'description' => 'Heart and cardiovascular diseases'],
            ['name' => 'Neurology', 'description' => 'Nervous system and brain diseases'],
            ['name' => 'Dermatology', 'description' => 'Skin diseases and conditions'],
            ['name' => 'Orthopedics', 'description' => 'Bones, joints, and musculoskeletal system'],
            ['name' => 'Pediatrics', 'description' => 'Medical care for children'],
            ['name' => 'Psychiatry', 'description' => 'Mental health and psychiatric disorders'],
            ['name' => 'Oncology', 'description' => 'Cancer treatment and diagnosis'],
            ['name' => 'Gastroenterology', 'description' => 'Digestive system diseases'],
            ['name' => 'Ophthalmology', 'description' => 'Eye and vision care'],
            ['name' => 'ENT (Otolaryngology)', 'description' => 'Ear, nose, and throat diseases'],
            ['name' => 'Nephrology', 'description' => 'Kidney and renal diseases'],
            ['name' => 'Pulmonology', 'description' => 'Lung and respiratory diseases'],
            ['name' => 'Endocrinology', 'description' => 'Hormonal and metabolic disorders'],
            ['name' => 'Rheumatology', 'description' => 'Joint and autoimmune diseases'],
            ['name' => 'Urology', 'description' => 'Urinary tract and male reproductive system'],
        ];

        foreach ($specializations as $spec) {
            Specialization::updateOrCreate(
                ['name' => $spec['name']],
                ['description' => $spec['description']]
            );
        }
    }
}
