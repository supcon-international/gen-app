# UNS Overview

Generated: 2025-09-25T06:26:12.002Z
Source: UNS Definition File

## Topics Summary

Total Topics: 70
Subscribe Topics: 49
Publish Topics: 21

## Topic List

### v1/FY-Fab/erp/state/order-registry

**Description:** ERP publishes current open orders registry (upsert/delete by order).
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "qty": 5000,
  "due_date": "2025-07-20",
  "priority": 50,
  "min_batch": 2000,
  "source": "ERP"
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "qty": 5000,
  "due_date": "2025-07-20",
  "priority": 50,
  "min_batch": 2000,
  "source": "ERP"
}
```

### v1/FY-Fab/plm/state/product-master-P-M5

**Description:** Product master: P-M5 screw (wire → CUTWIRE → COLD → THREAD → HT).
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "product_id": "P-M5",
  "name": "M5 螺丝",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH01",
  "default_station_3": "TR01",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_M5",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 2000,
  "batch_time_min_step_1": 33.3,
  "batch_time_min_step_2": 40,
  "batch_time_min_step_3": 50,
  "batch_time_min_step_4": 166.7
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "product_id": "P-M5",
  "name": "M5 螺丝",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH01",
  "default_station_3": "TR01",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_M5",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 2000,
  "batch_time_min_step_1": 33.3,
  "batch_time_min_step_2": 40,
  "batch_time_min_step_3": 50,
  "batch_time_min_step_4": 166.7
}
```

### v1/FY-Fab/plm/state/product-master-P-M6

**Description:** Product master: P-M6 screw (wire → CUTWIRE → COLD → THREAD → HT).
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "product_id": "P-M6",
  "name": "M6 螺丝",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH02",
  "default_station_3": "TR02",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_M6",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 2000,
  "batch_time_min_step_1": 33.3,
  "batch_time_min_step_2": 40,
  "batch_time_min_step_3": 50,
  "batch_time_min_step_4": 166.7
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "product_id": "P-M6",
  "name": "M6 螺丝",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH02",
  "default_station_3": "TR02",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_M6",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 2000,
  "batch_time_min_step_1": 33.3,
  "batch_time_min_step_2": 40,
  "batch_time_min_step_3": 50,
  "batch_time_min_step_4": 166.7
}
```

### v1/FY-Fab/plm/state/product-master-P-M8

**Description:** Product master: P-M8 bolt (wire → CUTWIRE → COLD → THREAD → HT).
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "product_id": "P-M8",
  "name": "M8 螺栓",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH01",
  "default_station_3": "TR01",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_M8",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 5000,
  "batch_time_min_step_1": 83.3,
  "batch_time_min_step_2": 100,
  "batch_time_min_step_3": 125,
  "batch_time_min_step_4": 416.7
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "product_id": "P-M8",
  "name": "M8 螺栓",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH01",
  "default_station_3": "TR01",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_M8",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 5000,
  "batch_time_min_step_1": 83.3,
  "batch_time_min_step_2": 100,
  "batch_time_min_step_3": 125,
  "batch_time_min_step_4": 416.7
}
```

### v1/FY-Fab/plm/state/product-master-P-FL6

**Description:** Product master: M6 flange bolt (wire → CUTWIRE → COLD → THREAD → HT).
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "product_id": "P-FL6",
  "name": "M6 法兰螺栓",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH02",
  "default_station_3": "TR02",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_FLANGE_M6",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 5000,
  "batch_time_min_step_1": 83.3,
  "batch_time_min_step_2": 100,
  "batch_time_min_step_3": 125,
  "batch_time_min_step_4": 416.7
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "product_id": "P-FL6",
  "name": "M6 法兰螺栓",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH02",
  "default_station_3": "TR02",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_FLANGE_M6",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 5000,
  "batch_time_min_step_1": 83.3,
  "batch_time_min_step_2": 100,
  "batch_time_min_step_3": 125,
  "batch_time_min_step_4": 416.7
}
```

### v1/FY-Fab/plm/state/product-master-P-PANEL1

**Description:** Product master: Sheet panel A (sheet → LASER → BEND → COAT → ASSY).
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "product_id": "P-PANEL1",
  "name": "钣金面板 A",
  "material_type": "sheet",
  "route_v": 1,
  "route_step_1": "LASER",
  "route_step_2": "BEND",
  "route_step_3": "COAT",
  "route_step_4": "ASSY",
  "default_station_1": "LASER01",
  "default_station_2": "BEND01",
  "default_station_3": "COAT01",
  "default_station_4": "ASSY01",
  "min_batch": 5,
  "batch_time_min_step_1": 10,
  "batch_time_min_step_2": 7.5,
  "batch_time_min_step_3": 15,
  "batch_time_min_step_4": 10
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "product_id": "P-PANEL1",
  "name": "钣金面板 A",
  "material_type": "sheet",
  "route_v": 1,
  "route_step_1": "LASER",
  "route_step_2": "BEND",
  "route_step_3": "COAT",
  "route_step_4": "ASSY",
  "default_station_1": "LASER01",
  "default_station_2": "BEND01",
  "default_station_3": "COAT01",
  "default_station_4": "ASSY01",
  "min_batch": 5,
  "batch_time_min_step_1": 10,
  "batch_time_min_step_2": 7.5,
  "batch_time_min_step_3": 15,
  "batch_time_min_step_4": 10
}
```

### v1/FY-Fab/plm/state/product-master-P-PANEL2

**Description:** Product master: Sheet panel B (sheet → LASER → BEND → COAT → ASSY).
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "product_id": "P-PANEL2",
  "name": "钣金面板 B",
  "material_type": "sheet",
  "route_v": 1,
  "route_step_1": "LASER",
  "route_step_2": "BEND",
  "route_step_3": "COAT",
  "route_step_4": "ASSY",
  "default_station_1": "LASER01",
  "default_station_2": "BEND01",
  "default_station_3": "COAT01",
  "default_station_4": "ASSY02",
  "min_batch": 10,
  "batch_time_min_step_1": 22,
  "batch_time_min_step_2": 16,
  "batch_time_min_step_3": 32,
  "batch_time_min_step_4": 22
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "product_id": "P-PANEL2",
  "name": "钣金面板 B",
  "material_type": "sheet",
  "route_v": 1,
  "route_step_1": "LASER",
  "route_step_2": "BEND",
  "route_step_3": "COAT",
  "route_step_4": "ASSY",
  "default_station_1": "LASER01",
  "default_station_2": "BEND01",
  "default_station_3": "COAT01",
  "default_station_4": "ASSY02",
  "min_batch": 10,
  "batch_time_min_step_1": 22,
  "batch_time_min_step_2": 16,
  "batch_time_min_step_3": 32,
  "batch_time_min_step_4": 22
}
```

### v1/FY-Fab/tooling/state/mold-MOLD_M5

**Description:** Cold header mold for M5 screws.
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_M5",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-M5"
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_M5",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-M5"
}
```

### v1/FY-Fab/tooling/state/mold-MOLD_M6

**Description:** Cold header mold for M6 screws.
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_M6",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-M6"
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_M6",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-M6"
}
```

### v1/FY-Fab/tooling/state/mold-MOLD_M8

**Description:** Cold header mold for M8 bolts.
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_M8",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-M8"
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_M8",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-M8"
}
```

### v1/FY-Fab/tooling/state/mold-MOLD_FLANGE_M6

**Description:** Cold header mold for M6 flange bolts.
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_FLANGE_M6",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-FL6"
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_FLANGE_M6",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": "P-FL6"
}
```

### v1/FY-Fab/tooling/state/mold-MOLD_STUD

**Description:** Cold header mold for studs.
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_STUD",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": ""
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "mold_id": "MOLD_STUD",
  "type": "cold_header",
  "qty": 1,
  "compatible_products": ""
}
```

### v1/FY-Fab/tooling/state/mold-ROLL_STD

**Description:** Thread rolling dies for standard thread.
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "mold_id": "ROLL_STD",
  "type": "thread_roller",
  "qty": 2,
  "compatible_products": "P-M5;P-M6;P-M8;P-FL6"
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "mold_id": "ROLL_STD",
  "type": "thread_roller",
  "qty": 2,
  "compatible_products": "P-M5;P-M6;P-M8;P-FL6"
}
```

### v1/FY-Fab/tooling/state/mold-ROLL_SELF_TAP

**Description:** Thread rolling dies for self-tapping thread.
**Permissions:** Subscribe

**Schema:**
```json
{
  "op": "upsert",
  "mold_id": "ROLL_SELF_TAP",
  "type": "thread_roller",
  "qty": 1,
  "compatible_products": ""
}
```

**Sample Data:**
```json
{
  "op": "upsert",
  "mold_id": "ROLL_SELF_TAP",
  "type": "thread_roller",
  "qty": 1,
  "compatible_products": ""
}
```

### v1/FY-Fab/tooling/state/changeover-matrix-cold-header

**Description:** Setup time matrix (minutes) for cold headers CH01/CH02 by product switch.
**Permissions:** Subscribe

**Schema:**
```json
{
  "function": "cold_header",
  "stations": "CH01;CH02",
  "matrix": {
    "P-M5": {
      "P-M5": 0,
      "P-M6": 15,
      "P-M8": 20,
      "P-FL6": 25
    },
    "P-M6": {
      "P-M5": 15,
      "P-M6": 0,
      "P-M8": 20,
      "P-FL6": 25
    },
    "P-M8": {
      "P-M5": 20,
      "P-M6": 20,
      "P-M8": 0,
      "P-FL6": 30
    },
    "P-FL6": {
      "P-M5": 25,
      "P-M6": 25,
      "P-M8": 30,
      "P-FL6": 0
    }
  }
}
```

**Sample Data:**
```json
{
  "function": "cold_header",
  "stations": "CH01;CH02",
  "matrix": {
    "P-M5": {
      "P-M5": 0,
      "P-M6": 15,
      "P-M8": 20,
      "P-FL6": 25
    },
    "P-M6": {
      "P-M5": 15,
      "P-M6": 0,
      "P-M8": 20,
      "P-FL6": 25
    },
    "P-M8": {
      "P-M5": 20,
      "P-M6": 20,
      "P-M8": 0,
      "P-FL6": 30
    },
    "P-FL6": {
      "P-M5": 25,
      "P-M6": 25,
      "P-M8": 30,
      "P-FL6": 0
    }
  }
}
```

### v1/FY-Fab/tooling/state/changeover-matrix-thread-roller

**Description:** Setup time matrix (minutes) for thread rollers TR01/TR02 by product switch.
**Permissions:** Subscribe

**Schema:**
```json
{
  "function": "thread_roller",
  "stations": "TR01;TR02",
  "matrix": {
    "P-M5": {
      "P-M5": 0,
      "P-M6": 0,
      "P-M8": 0,
      "P-FL6": 20
    },
    "P-M6": {
      "P-M5": 0,
      "P-M6": 0,
      "P-M8": 0,
      "P-FL6": 20
    },
    "P-M8": {
      "P-M5": 0,
      "P-M6": 0,
      "P-M8": 0,
      "P-FL6": 20
    },
    "P-FL6": {
      "P-M5": 15,
      "P-M6": 15,
      "P-M8": 15,
      "P-FL6": 0
    }
  }
}
```

**Sample Data:**
```json
{
  "function": "thread_roller",
  "stations": "TR01;TR02",
  "matrix": {
    "P-M5": {
      "P-M5": 0,
      "P-M6": 0,
      "P-M8": 0,
      "P-FL6": 20
    },
    "P-M6": {
      "P-M5": 0,
      "P-M6": 0,
      "P-M8": 0,
      "P-FL6": 20
    },
    "P-M8": {
      "P-M5": 0,
      "P-M6": 0,
      "P-M8": 0,
      "P-FL6": 20
    },
    "P-FL6": {
      "P-M5": 15,
      "P-M6": 15,
      "P-M8": 15,
      "P-FL6": 0
    }
  }
}
```

### v1/FY-Fab/warehouse/state/inventory-S1

**Description:** Inventory snapshot for material S1.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "S1",
  "name": "冷轧钢板",
  "type": "sheet",
  "spec": "1.0mm",
  "onhand_kg": 3000,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "S1",
  "name": "冷轧钢板",
  "type": "sheet",
  "spec": "1.0mm",
  "onhand_kg": 3000,
  "allocated_kg": 0
}
```

### v1/FY-Fab/warehouse/state/inventory-S2

**Description:** Inventory snapshot for material S2.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "S2",
  "name": "镀锌钢板",
  "type": "sheet",
  "spec": "1.0mm",
  "onhand_kg": 2000,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "S2",
  "name": "镀锌钢板",
  "type": "sheet",
  "spec": "1.0mm",
  "onhand_kg": 2000,
  "allocated_kg": 0
}
```

### v1/FY-Fab/warehouse/state/inventory-S3

**Description:** Inventory snapshot for material S3.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "S3",
  "name": "不锈钢板",
  "type": "sheet",
  "spec": "1.2mm",
  "onhand_kg": 1500,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "S3",
  "name": "不锈钢板",
  "type": "sheet",
  "spec": "1.2mm",
  "onhand_kg": 1500,
  "allocated_kg": 0
}
```

### v1/FY-Fab/warehouse/state/inventory-S4

**Description:** Inventory snapshot for material S4.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "S4",
  "name": "铝板",
  "type": "sheet",
  "spec": "2.0mm",
  "onhand_kg": 1000,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "S4",
  "name": "铝板",
  "type": "sheet",
  "spec": "2.0mm",
  "onhand_kg": 1000,
  "allocated_kg": 0
}
```

### v1/FY-Fab/warehouse/state/inventory-S5

**Description:** Inventory snapshot for material S5.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "S5",
  "name": "彩涂钢板",
  "type": "sheet",
  "spec": "0.8mm",
  "onhand_kg": 1200,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "S5",
  "name": "彩涂钢板",
  "type": "sheet",
  "spec": "0.8mm",
  "onhand_kg": 1200,
  "allocated_kg": 0
}
```

### v1/FY-Fab/warehouse/state/inventory-W1

**Description:** Inventory snapshot for material W1.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "W1",
  "name": "中碳钢丝",
  "type": "wire",
  "spec": "φ5.0mm",
  "onhand_kg": 5000,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "W1",
  "name": "中碳钢丝",
  "type": "wire",
  "spec": "φ5.0mm",
  "onhand_kg": 5000,
  "allocated_kg": 0
}
```

### v1/FY-Fab/warehouse/state/inventory-W2

**Description:** Inventory snapshot for material W2.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "W2",
  "name": "低碳钢丝",
  "type": "wire",
  "spec": "φ3.0mm",
  "onhand_kg": 4000,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "W2",
  "name": "低碳钢丝",
  "type": "wire",
  "spec": "φ3.0mm",
  "onhand_kg": 4000,
  "allocated_kg": 0
}
```

### v1/FY-Fab/warehouse/state/inventory-W3

**Description:** Inventory snapshot for material W3.
**Permissions:** Subscribe

**Schema:**
```json
{
  "material_id": "W3",
  "name": "不锈钢丝",
  "type": "wire",
  "spec": "φ4.0mm",
  "onhand_kg": 3000,
  "allocated_kg": 0
}
```

**Sample Data:**
```json
{
  "material_id": "W3",
  "name": "不锈钢丝",
  "type": "wire",
  "spec": "φ4.0mm",
  "onhand_kg": 3000,
  "allocated_kg": 0
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_LASER

**Description:** Operator group for LASER.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_LASER",
  "stage": "LASER",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_LASER",
  "stage": "LASER",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_BEND

**Description:** Operator group for BEND.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_BEND",
  "stage": "BEND",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_BEND",
  "stage": "BEND",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_COAT

**Description:** Operator group for COAT.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_COAT",
  "stage": "COAT",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_COAT",
  "stage": "COAT",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_ASSY

**Description:** Operator group for ASSY.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_ASSY",
  "stage": "ASSY",
  "per_shift_headcount": 2,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_ASSY",
  "stage": "ASSY",
  "per_shift_headcount": 2,
  "shifts": 2
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_CUT

**Description:** Operator group for CUTWIRE.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_CUT",
  "stage": "CUTWIRE",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_CUT",
  "stage": "CUTWIRE",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_COLD

**Description:** Operator group for COLD.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_COLD",
  "stage": "COLD",
  "per_shift_headcount": 2,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_COLD",
  "stage": "COLD",
  "per_shift_headcount": 2,
  "shifts": 2
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_THREAD

**Description:** Operator group for THREAD.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_THREAD",
  "stage": "THREAD",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_THREAD",
  "stage": "THREAD",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

### v1/FY-Fab/workforce/state/workgroup-OP_HEAT

**Description:** Operator group for HT.
**Permissions:** Subscribe

**Schema:**
```json
{
  "group_id": "OP_HEAT",
  "stage": "HT",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

**Sample Data:**
```json
{
  "group_id": "OP_HEAT",
  "stage": "HT",
  "per_shift_headcount": 1,
  "shifts": 2
}
```

### v1/FY-Fab/sched/state/plan-draft

**Description:** Draft production plan proposals before dispatch (does not start execution).
**Permissions:** Subscribe

**Schema:**
```json
{
  "plan_id": "PLAN-2025-09-05-01",
  "gen_ts": "2025-09-05T06:10:00Z",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "THREAD",
  "target_station": "TR02",
  "job_id": "JOB-000123",
  "batch_qty": 2000,
  "est_start_ts": "2025-09-05T08:00:00Z",
  "est_end_ts": "2025-09-05T11:00:00Z",
  "need_mold": "ROLL_STD",
  "need_changeover": "Y"
}
```

**Sample Data:**
```json
{
  "plan_id": "PLAN-2025-09-05-01",
  "gen_ts": "2025-09-05T06:10:00Z",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "THREAD",
  "target_station": "TR02",
  "job_id": "JOB-000123",
  "batch_qty": 2000,
  "est_start_ts": "2025-09-05T08:00:00Z",
  "est_end_ts": "2025-09-05T11:00:00Z",
  "need_mold": "ROLL_STD",
  "need_changeover": "Y"
}
```

### v1/FY-Fab/sched/state/queue-snapshot

**Description:** Aggregated view of station queues: counts of queued/running jobs.
**Permissions:** Subscribe

**Schema:**
```json
{
  "snapshot_ts": "2025-09-05T07:59:30Z",
  "station_count": 11,
  "queued_jobs": 18,
  "running_jobs": 5
}
```

**Sample Data:**
```json
{
  "snapshot_ts": "2025-09-05T07:59:30Z",
  "station_count": 11,
  "queued_jobs": 18,
  "running_jobs": 5
}
```

### v1/FY-Fab/sched/action/push-to-queue

**Description:** Action to send selected plan jobs into device queues (append/priority).
**Permissions:** Publish

**Schema:**
```json
{
  "plan_id": "PLAN-2025-09-05-01",
  "job_id": "JOB-000123",
  "target_function": "thread_roller",
  "target_station": "TR02",
  "dispatch_mode": "append"
}
```

**Sample Data:**
```json
{
  "plan_id": "PLAN-2025-09-05-01",
  "job_id": "JOB-000123",
  "target_function": "thread_roller",
  "target_station": "TR02",
  "dispatch_mode": "append"
}
```

### v1/FY-Fab/sheet/LASER01/state/current-job

**Description:** LASER01 current job state.
**Permissions:** Subscribe

**Schema:**
```json
{
  "job_id": "JOB-LZ-001",
  "status": "queued",
  "batch_qty": 5
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-LZ-001",
  "status": "queued",
  "batch_qty": 5
}
```

### v1/FY-Fab/sheet/LASER01/action/dispatch-task

**Description:** Dispatch job to LASER01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-LZ-001",
  "order_id": "PO-202507-1001",
  "product_id": "P-PANEL1",
  "step_code": "LASER",
  "batch_qty": 5
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-LZ-001",
  "order_id": "PO-202507-1001",
  "product_id": "P-PANEL1",
  "step_code": "LASER",
  "batch_qty": 5
}
```

### v1/FY-Fab/sheet/LASER01/action/start-task

**Description:** Start job on LASER01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-LZ-001",
  "operator_group": "OP_LASER",
  "expect_minutes": 10
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-LZ-001",
  "operator_group": "OP_LASER",
  "expect_minutes": 10
}
```

### v1/FY-Fab/sheet/LASER01/action/complete-task

**Description:** Complete job on LASER01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-LZ-001",
  "operator_group": "OP_LASER",
  "good_qty": 5,
  "end_reason": "normal"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-LZ-001",
  "operator_group": "OP_LASER",
  "good_qty": 5,
  "end_reason": "normal"
}
```

### v1/FY-Fab/sheet/LASER01/metrics/cycle-ms

**Description:** Cycle time metrics from LASER01.
**Permissions:** Subscribe

**Schema:**
```json
{
  "cycle_ms": 4500
}
```

**Sample Data:**
```json
{
  "cycle_ms": 4500
}
```

### v1/FY-Fab/sheet/BEND01/state/current-job

**Description:** BEND01 current job state.
**Permissions:** Subscribe

**Schema:**
```json
{
  "job_id": "JOB-BD-001",
  "status": "queued",
  "batch_qty": 5
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-BD-001",
  "status": "queued",
  "batch_qty": 5
}
```

### v1/FY-Fab/sheet/BEND01/action/dispatch-task

**Description:** Dispatch job to BEND01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-BD-001",
  "order_id": "PO-202507-1001",
  "product_id": "P-PANEL1",
  "step_code": "BEND",
  "batch_qty": 5
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-BD-001",
  "order_id": "PO-202507-1001",
  "product_id": "P-PANEL1",
  "step_code": "BEND",
  "batch_qty": 5
}
```

### v1/FY-Fab/sheet/BEND01/action/start-task

**Description:** Start job on BEND01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-BD-001",
  "operator_group": "OP_BEND",
  "expect_minutes": 7.5
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-BD-001",
  "operator_group": "OP_BEND",
  "expect_minutes": 7.5
}
```

### v1/FY-Fab/sheet/BEND01/action/complete-task

**Description:** Complete job on BEND01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-BD-001",
  "operator_group": "OP_BEND",
  "good_qty": 5,
  "end_reason": "normal"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-BD-001",
  "operator_group": "OP_BEND",
  "good_qty": 5,
  "end_reason": "normal"
}
```

### v1/FY-Fab/sheet/COAT01/state/clean-rule

**Description:** Powder coating cleaning rule.
**Permissions:** Subscribe

**Schema:**
```json
{
  "min_clean_time_min": 10,
  "trigger_on_color_change": "Y"
}
```

**Sample Data:**
```json
{
  "min_clean_time_min": 10,
  "trigger_on_color_change": "Y"
}
```

### v1/FY-Fab/sheet/COAT01/state/clean-status

**Description:** COAT01 cleaning status.
**Permissions:** Subscribe

**Schema:**
```json
{
  "status": "idle",
  "start_ts": ""
}
```

**Sample Data:**
```json
{
  "status": "idle",
  "start_ts": ""
}
```

### v1/FY-Fab/sheet/COAT01/action/clean-start

**Description:** Start cleaning on COAT01.
**Permissions:** Publish

**Schema:**
```json
{
  "by": "system",
  "reason": "color_change"
}
```

**Sample Data:**
```json
{
  "by": "system",
  "reason": "color_change"
}
```

### v1/FY-Fab/sheet/ASSY01/state/current-job

**Description:** ASSY01 current job state.
**Permissions:** Subscribe

**Schema:**
```json
{
  "job_id": "JOB-AS-001",
  "status": "queued",
  "batch_qty": 5
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-AS-001",
  "status": "queued",
  "batch_qty": 5
}
```

### v1/FY-Fab/sheet/ASSY02/state/current-job

**Description:** ASSY02 current job state.
**Permissions:** Subscribe

**Schema:**
```json
{
  "job_id": "JOB-AS-002",
  "status": "queued",
  "batch_qty": 10
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-AS-002",
  "status": "queued",
  "batch_qty": 10
}
```

### v1/FY-Fab/cold/CUT01/state/current-job

**Description:** CUT01 current job state.
**Permissions:** Subscribe

**Schema:**
```json
{
  "job_id": "JOB-CUT-001",
  "status": "queued",
  "batch_qty": 2000
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-CUT-001",
  "status": "queued",
  "batch_qty": 2000
}
```

### v1/FY-Fab/cold/CUT01/action/dispatch-task

**Description:** Dispatch job to CUT01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-CUT-001",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "CUTWIRE",
  "batch_qty": 2000
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-CUT-001",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "CUTWIRE",
  "batch_qty": 2000
}
```

### v1/FY-Fab/cold/CUT01/action/start-task

**Description:** Start job on CUT01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-CUT-001",
  "operator_group": "OP_CUT",
  "expect_minutes": 33.3
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-CUT-001",
  "operator_group": "OP_CUT",
  "expect_minutes": 33.3
}
```

### v1/FY-Fab/cold/CUT01/action/complete-task

**Description:** Complete job on CUT01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-CUT-001",
  "operator_group": "OP_CUT",
  "good_qty": 2000,
  "end_reason": "normal"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-CUT-001",
  "operator_group": "OP_CUT",
  "good_qty": 2000,
  "end_reason": "normal"
}
```

### v1/FY-Fab/cold/CH01/state/current-mold

**Description:** CH01 current mold and life.
**Permissions:** Subscribe

**Schema:**
```json
{
  "mold_id": "MOLD_M6",
  "since_ts": "2025-09-05T07:40:00Z",
  "life_used_cycles": 3200
}
```

**Sample Data:**
```json
{
  "mold_id": "MOLD_M6",
  "since_ts": "2025-09-05T07:40:00Z",
  "life_used_cycles": 3200
}
```

### v1/FY-Fab/cold/CH01/action/change-mold

**Description:** Change mold on CH01.
**Permissions:** Publish

**Schema:**
```json
{
  "to_mold": "MOLD_M5",
  "reason": "product_switch",
  "est_setup_min": 15
}
```

**Sample Data:**
```json
{
  "to_mold": "MOLD_M5",
  "reason": "product_switch",
  "est_setup_min": 15
}
```

### v1/FY-Fab/cold/CH01/action/dispatch-task

**Description:** Dispatch job to CH01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-CH1-001",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "COLD",
  "batch_qty": 2000,
  "need_mold": "MOLD_M6"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-CH1-001",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "COLD",
  "batch_qty": 2000,
  "need_mold": "MOLD_M6"
}
```

### v1/FY-Fab/cold/CH01/metrics/good-count

**Description:** Good part counter for CH01.
**Permissions:** Subscribe

**Schema:**
```json
{
  "count": 120
}
```

**Sample Data:**
```json
{
  "count": 120
}
```

### v1/FY-Fab/cold/CH02/state/current-mold

**Description:** CH02 current mold and life.
**Permissions:** Subscribe

**Schema:**
```json
{
  "mold_id": "MOLD_M8",
  "since_ts": "2025-09-05T08:00:00Z",
  "life_used_cycles": 500
}
```

**Sample Data:**
```json
{
  "mold_id": "MOLD_M8",
  "since_ts": "2025-09-05T08:00:00Z",
  "life_used_cycles": 500
}
```

### v1/FY-Fab/cold/CH02/action/change-mold

**Description:** Change mold on CH02.
**Permissions:** Publish

**Schema:**
```json
{
  "to_mold": "MOLD_FLANGE_M6",
  "reason": "product_switch",
  "est_setup_min": 25
}
```

**Sample Data:**
```json
{
  "to_mold": "MOLD_FLANGE_M6",
  "reason": "product_switch",
  "est_setup_min": 25
}
```

### v1/FY-Fab/cold/CH02/action/dispatch-task

**Description:** Dispatch job to CH02.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-CH2-001",
  "order_id": "PO-202507-0002",
  "product_id": "P-FL6",
  "step_code": "COLD",
  "batch_qty": 5000,
  "need_mold": "MOLD_FLANGE_M6"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-CH2-001",
  "order_id": "PO-202507-0002",
  "product_id": "P-FL6",
  "step_code": "COLD",
  "batch_qty": 5000,
  "need_mold": "MOLD_FLANGE_M6"
}
```

### v1/FY-Fab/cold/TR01/state/current-mold

**Description:** TR01 current rolling die and life.
**Permissions:** Subscribe

**Schema:**
```json
{
  "mold_id": "ROLL_STD",
  "since_ts": "2025-09-05T07:50:00Z",
  "life_used_cycles": 820
}
```

**Sample Data:**
```json
{
  "mold_id": "ROLL_STD",
  "since_ts": "2025-09-05T07:50:00Z",
  "life_used_cycles": 820
}
```

### v1/FY-Fab/cold/TR01/state/current-job

**Description:** TR01 current job state.
**Permissions:** Subscribe

**Schema:**
```json
{
  "job_id": "JOB-TR1-001",
  "status": "queued",
  "queued_ts": "2025-09-05T08:00:00Z",
  "start_ts": "",
  "end_ts": "",
  "batch_qty": 2000
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-TR1-001",
  "status": "queued",
  "queued_ts": "2025-09-05T08:00:00Z",
  "start_ts": "",
  "end_ts": "",
  "batch_qty": 2000
}
```

### v1/FY-Fab/cold/TR01/action/dispatch-task

**Description:** Dispatch job to TR01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-TR1-001",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "THREAD",
  "batch_qty": 2000,
  "need_mold": "ROLL_STD"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-TR1-001",
  "order_id": "PO-202507-0001",
  "product_id": "P-M6",
  "step_code": "THREAD",
  "batch_qty": 2000,
  "need_mold": "ROLL_STD"
}
```

### v1/FY-Fab/cold/TR01/action/start-task

**Description:** Start job on TR01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-TR1-001",
  "operator_group": "OP_THREAD",
  "expect_minutes": 50
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-TR1-001",
  "operator_group": "OP_THREAD",
  "expect_minutes": 50
}
```

### v1/FY-Fab/cold/TR01/action/complete-task

**Description:** Complete job on TR01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-TR1-001",
  "operator_group": "OP_THREAD",
  "good_qty": 2000,
  "end_reason": "normal"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-TR1-001",
  "operator_group": "OP_THREAD",
  "good_qty": 2000,
  "end_reason": "normal"
}
```

### v1/FY-Fab/cold/TR02/state/current-mold

**Description:** TR02 current rolling die and life.
**Permissions:** Subscribe

**Schema:**
```json
{
  "mold_id": "ROLL_STD",
  "since_ts": "2025-09-05T07:55:00Z",
  "life_used_cycles": 120
}
```

**Sample Data:**
```json
{
  "mold_id": "ROLL_STD",
  "since_ts": "2025-09-05T07:55:00Z",
  "life_used_cycles": 120
}
```

### v1/FY-Fab/cold/TR02/action/dispatch-task

**Description:** Dispatch job to TR02.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-TR2-001",
  "order_id": "PO-202507-0002",
  "product_id": "P-FL6",
  "step_code": "THREAD",
  "batch_qty": 5000,
  "need_mold": "ROLL_STD"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-TR2-001",
  "order_id": "PO-202507-0002",
  "product_id": "P-FL6",
  "step_code": "THREAD",
  "batch_qty": 5000,
  "need_mold": "ROLL_STD"
}
```

### v1/FY-Fab/cold/HT01/state/batch-status

**Description:** HT01 batch status.
**Permissions:** Subscribe

**Schema:**
```json
{
  "job_id": "JOB-HT-001",
  "status": "idle"
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-HT-001",
  "status": "idle"
}
```

### v1/FY-Fab/cold/HT01/action/start-task

**Description:** Start batch on HT01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-HT-001",
  "operator_group": "OP_HEAT",
  "expect_minutes": 166.7
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-HT-001",
  "operator_group": "OP_HEAT",
  "expect_minutes": 166.7
}
```

### v1/FY-Fab/cold/HT01/action/complete-task

**Description:** Complete batch on HT01.
**Permissions:** Publish

**Schema:**
```json
{
  "job_id": "JOB-HT-001",
  "operator_group": "OP_HEAT",
  "good_qty": 2000
}
```

**Sample Data:**
```json
{
  "job_id": "JOB-HT-001",
  "operator_group": "OP_HEAT",
  "good_qty": 2000
}
```

## Business Context

The UNS (Unified Namespace) structure follows the ISA-95 hierarchy:
- Enterprise: Top-level organization
- Site: Physical location
- Area: Functional area within site
- Line: Production or process line
- Cell: Individual equipment or sensor

This structure enables:
- Hierarchical data organization
- Context-aware data consumption
- Scalable integration patterns
- Real-time data flow across systems
