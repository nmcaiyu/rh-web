<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="房屋名称" prop="houseName">
        <el-input
          v-model="queryParams.houseName"
          placeholder="请输入房屋名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否出租" prop="houseLeaseFlag">
        <el-select v-model="queryParams.houseLeaseFlag" placeholder="是否出租" clearable filterable>
          <el-option
            v-for="dict in dict.type.sys_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="房屋位置" prop="houseLocation">
        <el-select v-model="queryParams.houseLocation" placeholder="房屋位置" clearable filterable>
          <el-option
            v-for="dict in dict.type.rh_house_location"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="房屋楼层" prop="houseFloor">
        <el-select v-model="queryParams.houseFloor" placeholder="房屋楼层" clearable filterable >
          <el-option
            v-for="dict in dict.type.rh_house_floor"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['landlord:house:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['landlord:house:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['landlord:house:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="houseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="房屋名称" align="center" prop="houseName" />
      <el-table-column label="房屋位置" align="center" prop="houseLocation">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.rh_house_location" :value="scope.row.houseLocation"/>
        </template>
      </el-table-column>
      <el-table-column label="房屋楼层" align="center" prop="houseFloor">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.rh_house_floor" :value="scope.row.houseFloor"/>
        </template>
      </el-table-column>
      <el-table-column label="是否出租" align="center" prop="houseLeaseFlag">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.houseLeaseFlag"/>
        </template>
      </el-table-column>
      <el-table-column label="房屋面积（平方米）" align="center" prop="houseArea" />
      <el-table-column label="房屋租金（元）" align="center" prop="houseRent" />
      <el-table-column label="最后电字（度）" align="center" prop="houseMeter" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['landlord:house:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['landlord:house:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改房屋信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="房屋名称" prop="houseName">
          <el-input v-model="form.houseName" placeholder="请输入房屋名称" />
        </el-form-item>
        <el-form-item label="房屋租金" prop="houseRent">
          <el-input v-model="form.houseRent" placeholder="请输入房屋租金（元）" />
        </el-form-item>
        <el-form-item label="是否出租" prop="houseLeaseFlag">
          <el-select v-model="form.houseLeaseFlag" placeholder="请选择是否出租" clearable filterable>
            <el-option
              v-for="dict in dict.type.sys_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              style="width: auto"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房屋位置" prop="houseLocation">
          <el-select v-model="form.houseLocation" placeholder="请选择房屋位置" clearable filterable>
            <el-option
              v-for="dict in dict.type.rh_house_location"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
              style="width: auto"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房屋楼层" prop="houseFloor">
          <el-select v-model="form.houseFloor" placeholder="请选择房屋楼层" clearable filterable>
            <el-option
              v-for="dict in dict.type.rh_house_floor"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
              style="width: auto"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房屋面积" prop="houseArea">
          <el-input v-model="form.houseArea" placeholder="请输入房屋面积（平方米）" />
        </el-form-item>
        <el-form-item label="最后电字" prop="houseMeter">
          <el-input v-model="form.houseMeter" placeholder="请输入最后电字（度）" />
        </el-form-item>
        <el-form-item label="房屋定位" prop="housePosition">
          <baidu-map ref="baiduMap" style="display:flex;flex-direction: column-reverse;" id="allmap" @ready="mapReady" @click="getLocation" :scroll-wheel-zoom="true">
            <div style="display:flex;align-items: center;margin-bottom:10px;">
              <bm-auto-complete v-model="searchJingwei" :sugStyle="{zIndex: 999999}">
                <el-input v-model="searchJingwei" style="width:300px;margin-right:5px" placeholder="输入地址"></el-input>
              </bm-auto-complete>
              <el-button type="primary" @click="getBaiduMapPoint">搜索</el-button>
              <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_LEFT"></bm-map-type>
              <bm-marker :position="{lng: longitude, lat: latitude}" />
            </div>
          </baidu-map>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listHouse, getHouse, delHouse, addHouse, updateHouse } from "@/api/landlord/house";

export default {
  name: "House",
  dicts: ['rh_house_location', 'sys_yes_no', 'rh_house_floor'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 房屋名称
      houseNames: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 房屋信息表格数据
      houseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        houseName: null,
        houseArea: null,
        houseLocation: null,
        housePosition: null,
        houseLeaseFlag: null,
        houseRentStart: null,
        houseRentEnd: null,
        houseFloor: null,
        houseMeter: null,
      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {
        houseName: [
          { required: true, message: "房屋名称不能为空", trigger: "blur" }
        ],
        houseLocation: [
          { required: true, message: "房屋位置不能为空", trigger: "blur" }
        ],
        houseLeaseFlag: [
          { required: true, message: "是否出租不能为空", trigger: "blur" }
        ],
        houseRent: [
          { required: true, message: "房屋租金不能为空", trigger: "blur" }
        ],
        houseFloor: [
          { required: true, message: "房屋楼层不能为空", trigger: "blur" }
        ]
      },
      searchJingwei:'',
      longitude:'',
      latitude:'',
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询房屋信息列表 */
    getList() {
      this.loading = true;
      listHouse(this.queryParams).then(response => {
        this.houseList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        houseName: null,
        houseArea: null,
        houseLocation: null,
        housePosition: null,
        houseLeaseFlag: null,
        houseRentStart: null,
        houseRentEnd: null,
        houseFloor: null,
        houseMeter: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
      this.resetForm("form");
      this.searchJingwei=''
      this.longitude=126.54
      this.latitude=45.80
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.houseNames = selection.map(item => item.houseName)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.updateMapCenter(this.longitude, this.latitude)
      this.open = true;
      this.title = "添加房屋信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getHouse(id).then(response => {
        this.form = response.data;
        let position=JSON.parse(this.form.housePosition)
        this.longitude=position.lng
        this.latitude=position.lat
        this.updateMapCenter(this.longitude, this.latitude)
        this.open = true;
        this.title = "修改房屋信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateHouse(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addHouse(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      const names = row.houseName || this.houseNames.join(",");
      this.$modal.confirm('是否确认删除房屋名称为"' + names + '"的数据项？').then(function() {
        return delHouse(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('landlord/house/export', {
        ...this.queryParams
      }, `house_${new Date().getTime()}.xlsx`)
    },
    //地图初始化
    mapReady({ BMap, map }) {
      // 选择一个经纬度作为中心点
      let point = new BMap.Point(this.longitude, this.latitude);
      map.centerAndZoom(point, 12);
      this.BMap=BMap
      this.map=map
    },
    //点击获取经纬度
    getLocation(e){
      this.longitude=e.point.lng
      this.latitude=e.point.lat
      this.form.housePosition=JSON.stringify(e.point)
    },
    //地址获取经纬度
    getBaiduMapPoint(){
      let that=this
      let myGeo = new this.BMap.Geocoder()
      myGeo.getPoint(this.searchJingwei,function(point){
        if(point){
          that.map.centerAndZoom(point,12)
          that.latitude=point.lat
          that.longitude=point.lng
          that.form.housePosition=JSON.stringify(point)
        }
      })
    },
    //手动更新地图中心点
    updateMapCenter(longitude, latitude){
      if (this.$refs.baiduMap) {
        setTimeout(() => {
          this.$refs.baiduMap.map.centerAndZoom(new this.BMap.Point(longitude, latitude), 12);
        }, 100);
      }
    }
  }
};
</script>

<style lang="scss">
  #allmap {
    height: 450px;
    width: 100%;
  }
  div[class$="anchorBL"] {
    display: none;
  }
</style>
